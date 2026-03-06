import { verifyToken } from '../../../lib/verifyToken';
import { fsGet } from '../../../lib/firestoreRest';

async function geocodeLatLng(lat, lng) {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key) throw new Error('Google Maps API key not configured');

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error(`Geocoding failed: ${data.status}`);
  }

  let stateName = null;
  for (const result of data.results) {
    for (const comp of result.address_components || []) {
      if (comp.types.includes('administrative_area_level_1')) {
        stateName = comp.long_name;
        break;
      }
    }
    if (stateName) break;
  }
  return stateName;
}

function normalizeState(s) {
  return s?.toLowerCase().replace(/[^a-z]/g, '') || '';
}

/**
 * POST /api/rides/validate-state
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let decoded, idToken;
  try {
    ({ decoded, idToken } = await verifyToken(req));
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { fromLat, fromLng, toLat, toLng } = req.body || {};
  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res.status(400).json({ error: 'Missing coordinates' });
  }

  const userDoc = await fsGet(`users/${decoded.uid}`, idToken);
  if (!userDoc || !userDoc.homeState) {
    return res.status(200).json({
      valid: false,
      reason: 'no_home_state',
      message: 'Home state not set. Please complete onboarding.',
    });
  }

  const homeState = userDoc.homeState;

  let fromState, toState;
  try {
    [fromState, toState] = await Promise.all([
      geocodeLatLng(fromLat, fromLng),
      geocodeLatLng(toLat, toLng),
    ]);
  } catch {
    return res.status(200).json({
      valid: false,
      reason: 'geocode_failed',
      message: 'Could not verify location state. Please check your internet connection and retry.',
    });
  }

  const homeNorm = normalizeState(homeState);
  const fromNorm = normalizeState(fromState);
  const toNorm = normalizeState(toState);

  if (!fromNorm || !toNorm) {
    return res.status(200).json({
      valid: false,
      reason: 'geocode_failed',
      message: 'Could not determine the state for one or both locations. Please retry.',
    });
  }

  if (fromNorm !== homeNorm || toNorm !== homeNorm) {
    const outside = [];
    if (fromNorm !== homeNorm) outside.push(`pickup (${fromState || 'unknown'})`);
    if (toNorm !== homeNorm) outside.push(`drop-off (${toState || 'unknown'})`);
    return res.status(200).json({
      valid: false,
      reason: 'outside_home_state',
      fromState,
      toState,
      homeState,
      message: `Travel outside your home state (${homeState}) is not supported yet. Your ${outside.join(' and ')} ${outside.length > 1 ? 'are' : 'is'} in a different state. Outstation travel will be available soon.`,
    });
  }

  return res.status(200).json({ valid: true, fromState, toState, homeState });
}
