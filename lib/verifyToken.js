/**
 * Shared token verifier for API routes.
 *
 * Strategy:
 *  1. Try firebase-admin verifyIdToken (fast — local JWT verification via Google public certs,
 *     does NOT require service-account credentials).
 *  2. If admin isn't configured or throws, fall back to the Firebase Identity Toolkit
 *     REST endpoint (network call, but works in any environment).
 *
 * Returns: { decoded: { uid, email, ... }, idToken: string }
 * The raw idToken is returned so callers can pass it to Firestore REST helpers.
 */
import { adminAuth } from './firebaseAdmin';

export async function verifyToken(req) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header');
  }
  const idToken = authorization.slice(7);

  // ── Attempt 1: Firebase Admin SDK (no service account needed for verifyIdToken) ──
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { decoded, idToken };
  } catch (adminErr) {
    // Only fall back if admin SDK fails (e.g. not configured in dev)
    // Re-throw permission errors immediately
    if (adminErr.code === 'auth/id-token-revoked') throw adminErr;
  }

  // ── Attempt 2: Firebase Identity Toolkit REST lookup (no credentials needed) ──
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error('Firebase API key not configured. Set NEXT_PUBLIC_FIREBASE_API_KEY.');

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || 'Invalid or expired token');
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || 'Invalid token');

  const user = data.users?.[0];
  if (!user) throw new Error('Token verified but user not found');

  return {
    decoded: {
      uid: user.localId,
      email: user.email || '',
      email_verified: user.emailVerified || false,
      name: user.displayName || '',
      picture: user.photoUrl || '',
      phone_number: user.phoneNumber || '',
    },
    idToken,
  };
}
