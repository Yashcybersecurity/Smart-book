import { verifyToken } from '../../../lib/verifyToken';
import { fsGet } from '../../../lib/firestoreRest';

/**
 * GET /api/user/me
 * Returns the authenticated user's Firestore document.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let decoded, idToken;
  try {
    ({ decoded, idToken } = await verifyToken(req));
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await fsGet(`users/${decoded.uid}`, idToken);

  if (!user) return res.status(404).json({ user: null });

  return res.status(200).json({ user });
}
