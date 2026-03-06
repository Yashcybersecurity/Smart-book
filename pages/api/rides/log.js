import { verifyToken } from '../../../lib/verifyToken';
import { fsAdd } from '../../../lib/firestoreRest';

/**
 * POST /api/rides/log
 * Saves a ride booking initiation to the user's rides subcollection.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let decoded, idToken;
  try {
    ({ decoded, idToken } = await verifyToken(req));
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const {
    provider, vehicleType, fareEstimate, fareRaw,
    fromAddress, fromLat, fromLng,
    toAddress, toLat, toLng,
    deepLink, webFallback,
  } = req.body || {};

  if (!provider || !vehicleType) {
    return res.status(400).json({ error: 'provider and vehicleType are required' });
  }

  const ride = {
    provider,
    vehicleType,
    fareEstimate: fareEstimate || '',
    fareRaw: fareRaw || 0,
    fromAddress: fromAddress || '',
    fromLat: fromLat || 0,
    fromLng: fromLng || 0,
    toAddress: toAddress || '',
    toLat: toLat || 0,
    toLng: toLng || 0,
    deepLink: deepLink || '',
    webFallback: webFallback || '',
    timestamp: new Date().toISOString(),
    status: 'initiated',
  };

  const added = await fsAdd(`users/${decoded.uid}/rides`, ride, idToken);
  return res.status(201).json({ success: true, rideId: added.id, ride });
}
