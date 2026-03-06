import { verifyToken } from '../../../lib/verifyToken';
import { fsQuery } from '../../../lib/firestoreRest';

/**
 * GET /api/rides/history?limit=10&startAfter=<ISO-timestamp>
 * Returns paginated ride history ordered by timestamp descending.
 * Provider filtering is done client-side (avoids Firestore composite index requirement).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let decoded, idToken;
  try {
    ({ decoded, idToken } = await verifyToken(req));
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { limit: limitQ, startAfter } = req.query;
  const pageSize = Math.min(parseInt(limitQ) || 10, 50);

  const rides = await fsQuery(
    `users/${decoded.uid}/rides`,
    {
      orderBy: { field: 'timestamp', desc: true },
      limit: pageSize,
      startAfter: startAfter || undefined,
    },
    idToken
  );

  const lastTimestamp =
    rides.length > 0 ? rides[rides.length - 1].timestamp : null;

  return res.status(200).json({
    rides,
    lastTimestamp,
    hasMore: rides.length === pageSize,
  });
}
