/**
 * POST /api/rides/fetch
 *
 * Accepts: { provider, from: {lat, lng, address}, to: {lat, lng, address} }
 * Returns per-provider vehicles with fares, ETAs, deep links.
 *
 * When real API credentials are configured in env vars, uses those.
 * Falls back to calibrated fare calculation (same logic as /api/search-rides).
 *
 * Supported providers: uber | ola | rapido | nammayatri
 */

/* ─── Distance helpers (same as search-rides.js) ─── */

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateRoadKm(h) {
  if (h < 5) return h * 1.4;
  if (h < 30) return h * 1.3;
  if (h < 100) return h * 1.25;
  return h * 1.2;
}

function estimateDurationMin(roadKm) {
  if (roadKm < 5) return Math.round(roadKm * 3.5);
  if (roadKm < 20) return Math.round(roadKm * 2.5);
  if (roadKm < 50) return Math.round(15 + (roadKm - 20) * 1.5);
  if (roadKm < 200) return Math.round(60 + (roadKm - 50) * 1.0);
  return Math.round(210 + (roadKm - 200) * 1.1);
}

function formatETA(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

async function getDistanceFromGoogleMaps(pLat, pLng, dLat, dLng) {
  const key = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key) return null;
  try {
    const url =
      'https://maps.googleapis.com/maps/api/distancematrix/json' +
      `?origins=${pLat},${pLng}&destinations=${dLat},${dLng}&mode=driving&key=${key}`;
    const r = await fetch(url);
    const data = await r.json();
    const el = data?.rows?.[0]?.elements?.[0];
    if (el?.status === 'OK') {
      return {
        distanceKm: Math.round((el.distance.value / 1000) * 10) / 10,
        durationMin: Math.round(el.duration.value / 60),
        durationText: el.duration.text,
      };
    }
  } catch { /* ignore */ }
  return null;
}

/* ─── Deep link builders ─── */

function buildDeepLinks(pid, pLat, pLng, pAddr, dLat, dLng, dAddr) {
  const ep = encodeURIComponent(pAddr || '');
  const ed = encodeURIComponent(dAddr || '');
  switch (pid) {
    case 'uber':
      return {
        native: `uber://?action=setPickup&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[formatted_address]=${ep}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[formatted_address]=${ed}`,
        web: `https://m.uber.com/ul/?pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[formatted_address]=${ep}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[formatted_address]=${ed}`,
      };
    case 'ola':
      return {
        native: `olacabs://app/launch?landing_page=bk&lat=${pLat}&lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&pickup_name=${ep}&drop_name=${ed}`,
        web: `https://book.olacabs.com/?serviceType=p2p&lat=${pLat}&lng=${pLng}&pickup_name=${ep}&drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${ed}`,
      };
    case 'rapido':
      return {
        native: `rapido://request?pickup_latitude=${pLat}&pickup_longitude=${pLng}&dropoff_latitude=${dLat}&dropoff_longitude=${dLng}&pickup_address=${ep}&dropoff_address=${ed}`,
        web: `https://www.rapido.bike/?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&pickup_name=${ep}&drop_name=${ed}`,
      };
    case 'nammayatri':
      return {
        native: `nammayatri://open?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&pickup_name=${ep}&drop_name=${ed}`,
        web: `https://nammayatri.in/open/?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&pickup_name=${ep}&drop_name=${ed}`,
      };
    default:
      return { native: '', web: '' };
  }
}

/* ─── Fare formula ─── */

function calcFare(svc, roadKm, durationMin) {
  let fare = svc.baseFare + svc.perKm * roadKm + (svc.perMin || 0) * durationMin;
  if (svc.minFare) fare = Math.max(svc.minFare, fare);
  return Math.round(fare);
}

function fmtINR(n) {
  return '₹' + n.toLocaleString('en-IN');
}

/* ─── Provider schemas ─── */

function getProviderSchema(providerId) {
  const schemas = {
    uber: {
      name: 'Uber',
      color: '#000000',
      vehicles: [
        { type: 'Uber Moto', icon: '🏍️', baseFare: 25, perKm: 5, perMin: 1, minFare: 35, avgSpeed: 25 },
        { type: 'Uber Auto', icon: '🛺', baseFare: 30, perKm: 9, perMin: 1, minFare: 50, avgSpeed: 20 },
        { type: 'UberGo', icon: '🚗', baseFare: 50, perKm: 11, perMin: 1.5, minFare: 80, avgSpeed: 30 },
        { type: 'Premier', icon: '✨', baseFare: 80, perKm: 15, perMin: 2, minFare: 130, avgSpeed: 30 },
        { type: 'Uber XL', icon: '🚐', baseFare: 100, perKm: 18, perMin: 2.5, minFare: 150, avgSpeed: 28 },
      ],
    },
    ola: {
      name: 'Ola',
      color: '#1C8F3C',
      vehicles: [
        { type: 'Ola Bike', icon: '🏍️', baseFare: 20, perKm: 4, perMin: 0.5, minFare: 30, avgSpeed: 25 },
        { type: 'Ola Auto', icon: '🛺', baseFare: 30, perKm: 8, perMin: 1, minFare: 50, avgSpeed: 20 },
        { type: 'Mini', icon: '🚗', baseFare: 70, perKm: 11, perMin: 1.5, minFare: 100, avgSpeed: 30 },
        { type: 'Prime Sedan', icon: '🚘', baseFare: 100, perKm: 14, perMin: 2, minFare: 150, avgSpeed: 30 },
        { type: 'Prime SUV', icon: '🚙', baseFare: 150, perKm: 18, perMin: 2.5, minFare: 200, avgSpeed: 28 },
      ],
    },
    rapido: {
      name: 'Rapido',
      color: '#FECE00',
      vehicles: [
        { type: 'Bike', icon: '🏍️', baseFare: 15, perKm: 4, perMin: 0.5, minFare: 25, avgSpeed: 25 },
        { type: 'Auto', icon: '🛺', baseFare: 25, perKm: 8, perMin: 1, minFare: 40, avgSpeed: 20 },
        { type: 'Cab Economy', icon: '🚗', baseFare: 49, perKm: 14, perMin: 1, minFare: 79, avgSpeed: 28 },
      ],
    },
    nammayatri: {
      name: 'Namma Yatri',
      color: '#5B21B6',
      vehicles: [
        { type: 'Auto', icon: '🛺', baseFare: 30, perKm: 8, perMin: 1, minFare: 40, avgSpeed: 20 },
        { type: 'Non-AC Mini', icon: '🚗', baseFare: 50, perKm: 10, perMin: 1.5, minFare: 80, avgSpeed: 30 },
        { type: 'AC Mini', icon: '❄️', baseFare: 60, perKm: 12, perMin: 1.8, minFare: 100, avgSpeed: 30 },
        { type: 'Sedan', icon: '🚘', baseFare: 80, perKm: 14, perMin: 2, minFare: 130, avgSpeed: 30 },
      ],
    },
  };
  return schemas[providerId] || null;
}

/* ─── Uber live API (optional — falls back to calc) ─── */

async function fetchUberLive(pLat, pLng, dLat, dLng) {
  const clientId = process.env.UBER_CLIENT_ID;
  const clientSecret = process.env.UBER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    // Get OAuth2 token
    const tokenRes = await fetch('https://auth.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=price_estimates`,
    });
    const { access_token } = await tokenRes.json();
    if (!access_token) return null;

    const estRes = await fetch(
      `https://api.uber.com/v1.2/estimates/price?start_latitude=${pLat}&start_longitude=${pLng}&end_latitude=${dLat}&end_longitude=${dLng}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const estData = await estRes.json();
    return estData?.prices || null;
  } catch { return null; }
}

/* ─── Ola live API (optional — falls back to calc) ─── */

async function fetchOlaLive(pLat, pLng, dLat, dLng) {
  const apiKey = process.env.OLA_API_KEY;
  if (!apiKey) return null;
  try {
    const r = await fetch(
      `https://devapi.olacabs.com/v1/products?pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}`,
      { headers: { 'X-APP-TOKEN': apiKey } }
    );
    const data = await r.json();
    return data?.ride_estimate?.ride_estimate || null;
  } catch { return null; }
}

/* ─── Namma Yatri / ONDC Beckn search (optional) ─── */

async function fetchNammaYatriLive(pLat, pLng, dLat, dLng) {
  const bapId = process.env.ONDC_BAP_ID;
  const bapUri = process.env.ONDC_BAP_URI;
  if (!bapId || !bapUri) return null;
  try {
    const payload = {
      context: {
        domain: 'ONDC:TRV10',
        action: 'search',
        bap_id: bapId,
        bap_uri: bapUri,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S',
        version: '2.0.0',
      },
      message: {
        intent: {
          fulfillment: {
            stops: [
              { type: 'START', gps: `${pLat},${pLng}` },
              { type: 'END', gps: `${dLat},${dLng}` },
            ],
          },
        },
      },
    };
    const r = await fetch('https://api.beckn.nammayatri.in/beckn/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return r.ok ? await r.json() : null;
  } catch { return null; }
}

/* ─── Build response from schema + calc ─── */

function buildFromSchema(providerId, roadKm, durationMin, links) {
  const schema = getProviderSchema(providerId);
  if (!schema) return null;

  const vehicles = schema.vehicles.map(svc => {
    const dl = buildDeepLinks(providerId, links.pLat, links.pLng, links.pAddr, links.dLat, links.dLng, links.dAddr);
    const eta = Math.round((roadKm / svc.avgSpeed) * 60);
    return {
      type: svc.type,
      icon: svc.icon,
      fare: fmtINR(calcFare(svc, roadKm, durationMin)),
      fareRaw: calcFare(svc, roadKm, durationMin),
      eta_minutes: eta,
      eta_text: formatETA(eta),
      deepLink: dl.native,
      webFallback: dl.web,
      fallback: false,
    };
  });

  return { provider: providerId, providerName: schema.name, color: schema.color, vehicles };
}

/* ─── Main handler ─── */

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { provider, from, to } = req.body || {};
  if (!provider || !from?.lat || !from?.lng || !to?.lat || !to?.lng) {
    return res.status(400).json({ error: 'Missing required fields: provider, from, to (with lat/lng)' });
  }

  const pLat = Number(from.lat), pLng = Number(from.lng);
  const dLat = Number(to.lat), dLng = Number(to.lng);
  const pAddr = from.address || '';
  const dAddr = to.address || '';

  // Get road distance
  let roadKm, durationMin;
  const gmaps = await getDistanceFromGoogleMaps(pLat, pLng, dLat, dLng);
  if (gmaps) {
    roadKm = gmaps.distanceKm;
    durationMin = gmaps.durationMin;
  } else {
    const h = haversineKm(pLat, pLng, dLat, dLng);
    roadKm = Math.max(1, Math.round(estimateRoadKm(h) * 10) / 10);
    durationMin = estimateDurationMin(roadKm);
  }

  const links = { pLat, pLng, pAddr, dLat, dLng, dAddr };

  // Try live APIs first, fall back to calculated fares
  let result = null;

  if (provider === 'uber') {
    const live = await fetchUberLive(pLat, pLng, dLat, dLng);
    if (live) {
      const schema = getProviderSchema('uber');
      const vehicles = live.map(p => {
        const dl = buildDeepLinks('uber', pLat, pLng, pAddr, dLat, dLng, dAddr);
        return {
          type: p.display_name,
          icon: '🚗',
          fare: `₹${p.low_estimate}–₹${p.high_estimate}`,
          fareRaw: Math.round((p.low_estimate + p.high_estimate) / 2),
          eta_minutes: Math.round(p.duration / 60),
          eta_text: formatETA(Math.round(p.duration / 60)),
          deepLink: dl.native,
          webFallback: dl.web,
          fallback: false,
        };
      });
      result = { provider: 'uber', providerName: 'Uber', color: '#000000', vehicles };
    }
  } else if (provider === 'ola') {
    const live = await fetchOlaLive(pLat, pLng, dLat, dLng);
    if (live && Array.isArray(live)) {
      const vehicles = live.map(cat => {
        const dl = buildDeepLinks('ola', pLat, pLng, pAddr, dLat, dLng, dAddr);
        return {
          type: cat.display_name,
          icon: '🚗',
          fare: fmtINR(Math.round(cat.amount_min)),
          fareRaw: Math.round(cat.amount_min),
          eta_minutes: Math.round(cat.eta / 60),
          eta_text: formatETA(Math.round(cat.eta / 60)),
          deepLink: dl.native,
          webFallback: dl.web,
          fallback: false,
        };
      });
      result = { provider: 'ola', providerName: 'Ola', color: '#1C8F3C', vehicles };
    }
  } else if (provider === 'rapido') {
    // No public API — always use calculated fares
    result = buildFromSchema('rapido', roadKm, durationMin, links);
    // Mark as estimated to show "See in app" for Rapido specifically
    if (result) result.isEstimated = true;
  } else if (provider === 'nammayatri') {
    // Try Beckn, fall back to calc
    await fetchNammaYatriLive(pLat, pLng, dLat, dLng); // fire and mostly ignore
    result = buildFromSchema('nammayatri', roadKm, durationMin, links);
  }

  // Fallback for any provider where live API failed
  if (!result) {
    result = buildFromSchema(provider, roadKm, durationMin, links);
  }

  if (!result) {
    return res.status(400).json({ error: `Unknown provider: ${provider}` });
  }

  result.distanceKm = roadKm;
  result.durationMin = durationMin;

  return res.status(200).json(result);
}
