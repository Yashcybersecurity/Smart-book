/**
 * Firestore REST API helper — authenticates with the user's own Firebase ID token.
 * Works WITHOUT Firebase Admin service-account credentials.
 * Firestore security rules are fully enforced (request.auth.uid is set from the token).
 */

const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'farexo-3ac88';

const DOCUMENTS_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/* ─── Value converters ─── */

function toFieldValue(v) {
  if (v === null || v === undefined) return { nullValue: 'NULL_VALUE' };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return { integerValue: String(v) };
    return { doubleValue: v };
  }
  if (typeof v === 'string') return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFieldValue) } };
  if (typeof v === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(v).map(([k, val]) => [k, toFieldValue(val)])
        ),
      },
    };
  }
  return { stringValue: String(v) };
}

function fromFieldValue(fv) {
  if (!fv) return null;
  if ('nullValue' in fv) return null;
  if ('booleanValue' in fv) return fv.booleanValue;
  if ('integerValue' in fv) return parseInt(fv.integerValue, 10);
  if ('doubleValue' in fv) return fv.doubleValue;
  if ('stringValue' in fv) return fv.stringValue;
  if ('timestampValue' in fv) return fv.timestampValue;
  if ('arrayValue' in fv) return (fv.arrayValue.values || []).map(fromFieldValue);
  if ('mapValue' in fv) return fromDoc(fv.mapValue);
  return null;
}

function toDoc(data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFieldValue(v);
  }
  return { fields };
}

function fromDoc(doc) {
  const result = {};
  for (const [k, v] of Object.entries(doc.fields || {})) {
    result[k] = fromFieldValue(v);
  }
  return result;
}

/* ─── Public API ─── */

/**
 * Get a single document.
 * Returns null if not found (404).
 */
export async function fsGet(path, token) {
  const res = await fetch(`${DOCUMENTS_URL}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore GET /${path} → ${res.status}: ${body}`);
  }
  const doc = await res.json();
  return { id: doc.name?.split('/').pop() || '', ...fromDoc(doc) };
}

/**
 * Create or merge-update a document (PATCH with updateMask).
 * Only the fields present in `data` are written; other fields are untouched.
 */
export async function fsSet(path, data, token) {
  const { fields } = toDoc(data);
  const mask = Object.keys(fields)
    .map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join('&');
  const res = await fetch(`${DOCUMENTS_URL}/${path}?${mask}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore SET /${path} → ${res.status}: ${body}`);
  }
  const doc = await res.json();
  return { id: doc.name?.split('/').pop() || '', ...fromDoc(doc) };
}

/**
 * Add a new document with auto-generated ID to a collection.
 * Returns { id, ...data }.
 */
export async function fsAdd(collectionPath, data, token) {
  const res = await fetch(`${DOCUMENTS_URL}/${collectionPath}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(toDoc(data)),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore ADD /${collectionPath} → ${res.status}: ${body}`);
  }
  const doc = await res.json();
  return { id: doc.name?.split('/').pop() || '', ...fromDoc(doc) };
}

/**
 * Run a structured query against a collection.
 *
 * @param {string} collectionPath  e.g. 'users/uid/rides'
 * @param {object} opts
 *   - where:  [[field, op, value], ...]  e.g. [['provider','==','uber']]
 *   - orderBy: { field: 'timestamp', desc: true }
 *   - limit:  number
 *   - startAfter: raw field value (must match first orderBy field's type)
 * @param {string} token  Firebase ID token
 */
export async function fsQuery(collectionPath, opts = {}, token) {
  const { where = [], orderBy, limit, startAfter } = opts;

  // Last path segment is the collection ID; everything before is the parent document path
  const parts = collectionPath.split('/');
  const collectionId = parts[parts.length - 1];
  const parentDocPath = parts.slice(0, -1).join('/');

  const structuredQuery = {
    from: [{ collectionId }],
  };

  // WHERE clause
  if (where.length === 1) {
    const [field, op, value] = where[0];
    structuredQuery.where = {
      fieldFilter: {
        field: { fieldPath: field },
        op: OP_MAP[op] || 'EQUAL',
        value: toFieldValue(value),
      },
    };
  } else if (where.length > 1) {
    structuredQuery.where = {
      compositeFilter: {
        op: 'AND',
        filters: where.map(([field, op, value]) => ({
          fieldFilter: {
            field: { fieldPath: field },
            op: OP_MAP[op] || 'EQUAL',
            value: toFieldValue(value),
          },
        })),
      },
    };
  }

  // ORDER BY
  if (orderBy) {
    structuredQuery.orderBy = [
      {
        field: { fieldPath: orderBy.field },
        direction: orderBy.desc ? 'DESCENDING' : 'ASCENDING',
      },
    ];
  }

  // LIMIT
  if (typeof limit === 'number') structuredQuery.limit = limit;

  // CURSOR (startAfter)
  if (startAfter !== undefined && startAfter !== null) {
    structuredQuery.startAt = {
      values: [toFieldValue(startAfter)],
      before: false, // false = strictly after (exclusive)
    };
  }

  const queryUrl = parentDocPath
    ? `${DOCUMENTS_URL}/${parentDocPath}:runQuery`
    : `${DOCUMENTS_URL}:runQuery`;

  const res = await fetch(queryUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Firestore QUERY /${collectionPath} → ${res.status}: ${body}`);
  }

  const results = await res.json();
  return results
    .filter(r => r.document)
    .map(r => ({
      id: r.document.name?.split('/').pop() || '',
      ...fromDoc(r.document),
    }));
}

const OP_MAP = {
  '==': 'EQUAL',
  '!=': 'NOT_EQUAL',
  '<': 'LESS_THAN',
  '<=': 'LESS_THAN_OR_EQUAL',
  '>': 'GREATER_THAN',
  '>=': 'GREATER_THAN_OR_EQUAL',
  'in': 'IN',
  'array-contains': 'ARRAY_CONTAINS',
};
