import { verifyToken } from '../../../lib/verifyToken';
import { fsGet, fsSet } from '../../../lib/firestoreRest';

/**
 * POST /api/user/create
 * Idempotent — creates user doc only if it does not already exist.
 * Called server-side immediately after every auth event (login or signup).
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let decoded, idToken;
  try {
    ({ decoded, idToken } = await verifyToken(req));
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { uid, email, displayName, photoURL, phoneNumber } = req.body || {};

  // Only the authenticated user can create their own document
  if (decoded.uid !== uid) return res.status(403).json({ error: 'Forbidden' });

  const existing = await fsGet(`users/${uid}`, idToken);

  if (existing) {
    // Already exists — just refresh lastActive
    const now = new Date().toISOString();
    await fsSet(`users/${uid}`, { lastActive: now }, idToken);
    return res.status(200).json({ created: false, user: existing });
  }

  const now = new Date().toISOString();
  const newUser = {
    uid,
    email: email || decoded.email || '',
    displayName: displayName || decoded.name || '',
    photoURL: photoURL || decoded.picture || '',
    phoneNumber: phoneNumber || decoded.phone_number || '',
    homeState: '',
    preferredProviders: ['uber', 'ola', 'rapido', 'nammayatri'],
    createdAt: now,
    lastActive: now,
  };

  await fsSet(`users/${uid}`, newUser, idToken);
  return res.status(201).json({ created: true, user: newUser });
}
