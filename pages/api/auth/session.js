import { createSessionToken } from '../../../lib/sessionToken';
import { verifyToken } from '../../../lib/verifyToken';

function setCookie(res, name, value, maxAge = 0) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const expiry = maxAge
    ? `; Max-Age=${maxAge}`
    : '; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
  res.setHeader(
    'Set-Cookie',
    `${name}=${value}; Path=/; SameSite=lax${expiry}; HttpOnly${secure}`
  );
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

    let decoded;
    try {
      // verifyToken does NOT need service-account credentials
      const result = await verifyToken({ headers: { authorization: `Bearer ${idToken}` } });
      decoded = result.decoded;
    } catch (e) {
      console.error('Session verify error:', e.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Create a 5-day HMAC-signed session JWT (no service account needed)
    const expiresIn = 60 * 60 * 24 * 5;
    const sessionToken = createSessionToken(decoded.uid, decoded.email, expiresIn);
    setCookie(res, 'session', sessionToken, expiresIn);
    return res.status(200).json({ success: true, uid: decoded.uid });
  }

  if (req.method === 'DELETE') {
    setCookie(res, 'session', '');
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
