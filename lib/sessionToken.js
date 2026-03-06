/**
 * HMAC-SHA256 signed JWT for session cookies.
 * Does NOT require Firebase Admin service-account credentials.
 * The session cookie only controls routing (middleware); actual
 * API-route authorization still uses the Firebase ID token.
 */
import crypto from 'crypto';

const SECRET =
  process.env.SESSION_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'farexo-dev-secret-change-in-production';

function b64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function createSessionToken(uid, email, expiresInSeconds = 86400 * 5) {
  const header = b64({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const payload = b64({ uid, email, iat: now, exp: now + expiresInSeconds });
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${sig}`;
}

export function verifySessionToken(token) {
  try {
    const parts = (token || '').split('.');
    if (parts.length !== 3) return null;
    const [header, payload, sig] = parts;
    const expected = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (sig !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}
