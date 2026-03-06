import { verifyToken } from '../../../lib/verifyToken';
import { fsSet } from '../../../lib/firestoreRest';

const ALLOWED_FIELDS = ['displayName', 'phoneNumber', 'homeState', 'preferredProviders'];

/**
 * POST /api/user/update
 * Partial update of a user's Firestore document.
 * Only whitelisted fields can be updated.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let decoded, idToken;
  try {
    ({ decoded, idToken } = await verifyToken(req));
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (req.body && req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.lastActive = new Date().toISOString();

  await fsSet(`users/${decoded.uid}`, updates, idToken);
  return res.status(200).json({ success: true, updated: Object.keys(updates) });
}
