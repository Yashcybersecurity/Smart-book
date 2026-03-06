/**
 * POST /api/search-rides
 *
 * Aggregator middleware - accepts pickup/dropoff coords, returns ride estimates.
 *
 * Distance and duration are LIVE from Google Maps Distance Matrix API.
 * Vehicle types and names match each provider's real app exactly.
 * Fare rates are calibrated against real app pricing (Feb 2026).
 *
 * Body: { pickup_lat, pickup_lng, dropoff_lat, dropoff_lng }
 * Response: { status, currency_symbol, distance_km, duration_text, is_intercity, providers[] }
 */

/* ======= Haversine fallback (when Google Maps API unavailable) ======= */

function haversineKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = ((lat2 - lat1) * Math.PI) / 180;
  var dLng = ((lng2 - lng1) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateRoadKm(haversine) {
  if (haversine < 5) return haversine * 1.4;
  if (haversine < 30) return haversine * 1.3;
  if (haversine < 100) return haversine * 1.25;
  return haversine * 1.2;
}

function estimateDurationMin(roadKm) {
  if (roadKm < 5) return Math.round(roadKm * 3.5);
  if (roadKm < 20) return Math.round(roadKm * 2.5);
  if (roadKm < 50) return Math.round(15 + (roadKm - 20) * 1.5);
  if (roadKm < 200) return Math.round(60 + (roadKm - 50) * 1.0);
  return Math.round(210 + (roadKm - 200) * 1.1);
}

function formatDuration(minutes) {
  if (minutes < 60) return minutes + ' min';
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  if (m === 0) return h + ' hr';
  return h + ' hr ' + m + ' min';
}

/* ======= Google Maps Distance Matrix API (LIVE distance + duration) ======= */

async function getGoogleMapsDistance(pickupLat, pickupLng, dropoffLat, dropoffLng) {
  var key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!key) return null;

  try {
    var url =
      'https://maps.googleapis.com/maps/api/distancematrix/json' +
      '?origins=' + pickupLat + ',' + pickupLng +
      '&destinations=' + dropoffLat + ',' + dropoffLng +
      '&mode=driving&key=' + key;

    var response = await fetch(url);
    var data = await response.json();

    if (
      data.status === 'OK' &&
      data.rows && data.rows[0] &&
      data.rows[0].elements && data.rows[0].elements[0] &&
      data.rows[0].elements[0].status === 'OK'
    ) {
      var el = data.rows[0].elements[0];
      return {
        distanceKm: Math.round((el.distance.value / 1000) * 10) / 10,
        durationMin: Math.round(el.duration.value / 60),
        durationText: el.duration.text,
      };
    }
    console.warn('Distance Matrix non-OK:', data.status);
  } catch (err) {
    console.warn('Distance Matrix failed:', err.message);
  }
  return null;
}

/* ======= Provider definitions ======= */
/*
 * Vehicle type names match EXACTLY what each provider's real app shows.
 * Rates calibrated against real app prices (Feb 2026 screenshots).
 *
 * City fare    = baseFare + perKm * distance + perMin * duration
 * Outstation   = baseFare + perKm * distance  (driver allowance baked into perKm)
 */

function getProviders(pLat, pLng, dLat, dLng, pickupAddr, dropoffAddr) {
  // Encode addresses for use in URLs
  var pAddr = encodeURIComponent(pickupAddr || '');
  var dAddr = encodeURIComponent(dropoffAddr || '');

  return [
    /* ---- Uber ------------------------------------------------ */
    {
      id: 'uber',
      name: 'Uber',
      logo: '/logos/uber.svg',
      color: '#000000',
      cityServices: [
        { type: 'Uber Moto',     icon: '\uD83C\uDFCD\uFE0F', baseFare: 25,  perKm: 5,   perMin: 1,   minFare: 35,  avgSpeedKmh: 25 },
        { type: 'Uber Auto',     icon: '\uD83D\uDEFA',       baseFare: 30,  perKm: 9,   perMin: 1,   minFare: 50,  avgSpeedKmh: 20 },
        { type: 'UberGo',        icon: '\uD83D\uDE97',       baseFare: 50,  perKm: 11,  perMin: 1.5, minFare: 80,  avgSpeedKmh: 30 },
        { type: 'Premier',       icon: '\u2728',             baseFare: 80,  perKm: 15,  perMin: 2,   minFare: 130, avgSpeedKmh: 30 },
        { type: 'Uber XL',       icon: '\uD83D\uDE90',       baseFare: 100, perKm: 18,  perMin: 2.5, minFare: 150, avgSpeedKmh: 28 },
      ],
      intercityServices: [
        { type: 'Go Intercity',    icon: '\uD83D\uDE97', baseFare: 299, perKm: 16.5, avgSpeedKmh: 55, desc: 'Affordable outstation rides in compact cars' },
        { type: 'Sedan Intercity', icon: '\uD83D\uDE98', baseFare: 399, perKm: 16.8, avgSpeedKmh: 55, desc: 'Outstation rides in comfortable sedans' },
        { type: 'XL Intercity',   icon: '\uD83D\uDE90', baseFare: 499, perKm: 24.1, avgSpeedKmh: 50, desc: 'Outstation rides in spacious SUVs' },
      ],
      mobileScheme: 'uber://?action=setPickup&pickup[latitude]=' + pLat + '&pickup[longitude]=' + pLng + '&pickup[formatted_address]=' + pAddr + '&dropoff[latitude]=' + dLat + '&dropoff[longitude]=' + dLng + '&dropoff[formatted_address]=' + dAddr,
      webFallback: 'https://www.uber.com/go?pickup_latitude=' + pLat + '&pickup_longitude=' + pLng + '&pickup_address=' + pAddr + '&dropoff_latitude=' + dLat + '&dropoff_longitude=' + dLng + '&dropoff_address=' + dAddr,
    },

    /* ---- Ola ------------------------------------------------- */
    {
      id: 'ola',
      name: 'Ola',
      logo: '/logos/ola.svg',
      color: '#1C8F3C',
      cityServices: [
        { type: 'Ola Bike',        icon: '\uD83C\uDFCD\uFE0F', baseFare: 20,  perKm: 4,  perMin: 0.5, minFare: 30,  avgSpeedKmh: 25 },
        { type: 'Ola Auto',        icon: '\uD83D\uDEFA',       baseFare: 30,  perKm: 8,  perMin: 1,   minFare: 50,  avgSpeedKmh: 20 },
        { type: 'Mini',            icon: '\uD83D\uDE97',       baseFare: 70,  perKm: 11, perMin: 1.5, minFare: 100, avgSpeedKmh: 30 },
        { type: 'Prime Sedan',     icon: '\uD83D\uDE98',       baseFare: 100, perKm: 14, perMin: 2,   minFare: 150, avgSpeedKmh: 30 },
        { type: 'Prime SUV',       icon: '\uD83D\uDE99',       baseFare: 150, perKm: 18, perMin: 2.5, minFare: 200, avgSpeedKmh: 28 },
        { type: 'Prime SUV+',      icon: '\uD83D\uDE99',       baseFare: 250, perKm: 30, perMin: 3.5, minFare: 350, avgSpeedKmh: 28 },
        { type: 'Prime Plus',      icon: '\uD83D\uDE98',       baseFare: 120, perKm: 16, perMin: 2.5, minFare: 180, avgSpeedKmh: 30 },
      ],
      intercityServices: [
        { type: 'Mini',        icon: '\uD83D\uDE97', baseFare: 299, perKm: 15.0, avgSpeedKmh: 55, desc: 'Indica, Micra, Ritz - Affordable AC cabs with free Wi-Fi' },
        { type: 'Prime Sedan', icon: '\uD83D\uDE98', baseFare: 399, perKm: 15.0, avgSpeedKmh: 55, desc: 'Dzire, Etios, Sunny - Comfortable sedans with extra legroom' },
        { type: 'Prime SUV',   icon: '\uD83D\uDE99', baseFare: 499, perKm: 18.2, avgSpeedKmh: 50, desc: 'Enjoy, Ertiga - Spacious SUVs for group travel' },
        { type: 'Prime SUV+',  icon: '\uD83D\uDE99', baseFare: 999, perKm: 36.9, avgSpeedKmh: 50, desc: 'Innova, Crysta - Comfortable SUVs for smooth rides' },
        { type: 'Prime Plus',  icon: '\uD83D\uDE98', baseFare: 599, perKm: 18.7, avgSpeedKmh: 55, desc: 'Premium sedans for a luxurious experience' },
      ],
      mobileScheme: 'olacabs://app/launch?landing_page=bk&lat=' + pLat + '&lng=' + pLng + '&drop_lat=' + dLat + '&drop_lng=' + dLng + '&pickup_name=' + pAddr + '&drop_name=' + dAddr,
      webFallback: 'https://book.olacabs.com/?serviceType=p2p&lat=' + pLat + '&lng=' + pLng + '&pickup_name=' + pAddr + '&drop_lat=' + dLat + '&drop_lng=' + dLng + '&drop_name=' + dAddr,
    },

    /* ---- Rapido ---------------------------------------------- */
    {
      id: 'rapido',
      name: 'Rapido',
      logo: '/logos/rapido.svg',
      color: '#FECE00',
      cityServices: [
        { type: 'Bike',  icon: '\uD83C\uDFCD\uFE0F', baseFare: 15, perKm: 4, perMin: 0.5, minFare: 25, avgSpeedKmh: 25 },
        { type: 'Auto',  icon: '\uD83D\uDEFA',       baseFare: 25, perKm: 8, perMin: 1,   minFare: 40, avgSpeedKmh: 20 },
        { type: 'Cab Economy', icon: '\uD83D\uDE97',  baseFare: 49, perKm: 14, perMin: 1, minFare: 79, avgSpeedKmh: 28 },
      ],
      intercityServices: [],
      mobileScheme: 'rapido://request?pickup_latitude=' + pLat + '&pickup_longitude=' + pLng + '&dropoff_latitude=' + dLat + '&dropoff_longitude=' + dLng + '&pickup_address=' + pAddr + '&dropoff_address=' + dAddr,
      webFallback: 'https://www.rapido.bike/?pickup_lat=' + pLat + '&pickup_lng=' + pLng + '&drop_lat=' + dLat + '&drop_lng=' + dLng + '&pickup_name=' + pAddr + '&drop_name=' + dAddr,
    },

    /* ---- Namma Yatri ----------------------------------------- */
    {
      id: 'namma_yatri',
      name: 'Namma Yatri',
      logo: '/logos/namma-yatri.svg',
      color: '#FFD700',
      cityServices: [
        { type: 'Auto',         icon: '\uD83D\uDEFA', baseFare: 30,  perKm: 8,  perMin: 1,   minFare: 40,  avgSpeedKmh: 20 },
        { type: 'Non-AC Mini',  icon: '\uD83D\uDE97', baseFare: 50,  perKm: 10, perMin: 1.5, minFare: 80,  avgSpeedKmh: 30 },
        { type: 'AC Mini',      icon: '\u2744\uFE0F', baseFare: 60,  perKm: 12, perMin: 1.8, minFare: 100, avgSpeedKmh: 30 },
        { type: 'Sedan',        icon: '\uD83D\uDE98', baseFare: 80,  perKm: 14, perMin: 2,   minFare: 130, avgSpeedKmh: 30 },
        { type: 'XL Plus',      icon: '\uD83D\uDE90', baseFare: 120, perKm: 19, perMin: 2.5, minFare: 180, avgSpeedKmh: 28 },
      ],
      intercityServices: [
        { type: 'Non-AC Mini',  icon: '\uD83D\uDE97', baseFare: 199, perKm: 11,  avgSpeedKmh: 55, desc: 'Budget-friendly hatchbacks for outstation' },
        { type: 'AC Mini',      icon: '\u2744\uFE0F', baseFare: 249, perKm: 13,  avgSpeedKmh: 55, desc: 'AC hatchbacks for comfortable outstation rides' },
        { type: 'Sedan',        icon: '\uD83D\uDE98', baseFare: 299, perKm: 15,  avgSpeedKmh: 55, desc: 'Comfortable sedans for outstation' },
        { type: 'XL Plus',      icon: '\uD83D\uDE90', baseFare: 399, perKm: 21,  avgSpeedKmh: 50, desc: 'Spacious vehicles for group outstation trips' },
      ],
      mobileScheme: 'nammayatri://open?pickup_lat=' + pLat + '&pickup_lng=' + pLng + '&drop_lat=' + dLat + '&drop_lng=' + dLng + '&pickup_name=' + pAddr + '&drop_name=' + dAddr,
      webFallback: 'https://nammayatri.in/open/?pickup_lat=' + pLat + '&pickup_lng=' + pLng + '&drop_lat=' + dLat + '&drop_lng=' + dLng + '&pickup_name=' + pAddr + '&drop_name=' + dAddr,
    },

    /* ---- Quick Ride ------------------------------------------ */
    {
      id: 'quick_ride',
      name: 'Quick Ride',
      logo: '/logos/quick-ride.svg',
      color: '#2B6CB0',
      cityServices: [
        { type: 'Bike Pool', icon: '\uD83C\uDFCD\uFE0F', baseFare: 10, perKm: 3, perMin: 0, minFare: 20, avgSpeedKmh: 22 },
        { type: 'Car Pool',  icon: '\uD83D\uDE97',       baseFare: 15, perKm: 4, perMin: 0, minFare: 30, avgSpeedKmh: 28 },
      ],
      intercityServices: [
        { type: 'Car Pool', icon: '\uD83D\uDE97', baseFare: 50, perKm: 5, avgSpeedKmh: 55, desc: 'Share a ride for outstation trips' },
      ],
      mobileScheme: 'https://www.quickride.in/?pickup_lat=' + pLat + '&pickup_lng=' + pLng + '&dropoff_lat=' + dLat + '&dropoff_lng=' + dLng,
      webFallback: 'https://www.quickride.in/?pickup_lat=' + pLat + '&pickup_lng=' + pLng + '&dropoff_lat=' + dLat + '&dropoff_lng=' + dLng,
    },
  ];
}

/* ======= Build grouped provider results ======= */

function buildResults(providers, roadKm, durationMin, isIntercity) {
  var grouped = [];

  for (var i = 0; i < providers.length; i++) {
    var provider = providers[i];
    var services = isIntercity ? provider.intercityServices : provider.cityServices;

    if (!services || services.length === 0) continue;

    var builtServices = [];
    for (var j = 0; j < services.length; j++) {
      var svc = services[j];

      var fare;
      if (isIntercity) {
        // Outstation = baseFare + perKm * distance
        fare = svc.baseFare + svc.perKm * roadKm;
      } else {
        // City = baseFare + perKm * distance + perMin * duration
        fare = svc.baseFare + svc.perKm * roadKm + (svc.perMin || 0) * durationMin;
      }

      // Enforce minimum fare (city rides only)
      if (!isIntercity && svc.minFare) {
        fare = Math.max(svc.minFare, fare);
      }

      // Round to 2 decimal places (paise)
      fare = Math.round(fare * 100) / 100;

      // Per-service ETA
      var svcDurationMin = Math.round((roadKm / (svc.avgSpeedKmh || 30)) * 60);

      builtServices.push({
        id: provider.id + '_' + svc.type.toLowerCase().replace(/[\s\-\+]+/g, '_'),
        type: svc.type,
        icon: svc.icon,
        price: fare,
        eta_minutes: svcDurationMin,
        eta_text: formatDuration(svcDurationMin),
        desc: svc.desc || '',
        surge_multiplier: 1.0,
      });
    }

    grouped.push({
      provider_id: provider.id,
      provider_name: provider.name,
      logo: provider.logo,
      color: provider.color,
      service_count: builtServices.length,
      action_urls: {
        mobile_scheme: provider.mobileScheme,
        web_fallback: provider.webFallback,
      },
      services: builtServices,
    });
  }

  return grouped;
}

/* ======= API handler ======= */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  var body = req.body || {};
  if (!body.pickup_lat || !body.pickup_lng || !body.dropoff_lat || !body.dropoff_lng) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: pickup_lat, pickup_lng, dropoff_lat, dropoff_lng',
    });
  }

  var pLat = Number(body.pickup_lat);
  var pLng = Number(body.pickup_lng);
  var dLat = Number(body.dropoff_lat);
  var dLng = Number(body.dropoff_lng);

  // LIVE distance and duration from Google Maps
  var roadKm, durationMin, durationText;
  var gmaps = await getGoogleMapsDistance(pLat, pLng, dLat, dLng);

  if (gmaps) {
    roadKm = gmaps.distanceKm;
    durationMin = gmaps.durationMin;
    durationText = gmaps.durationText;
  } else {
    var straightKm = haversineKm(pLat, pLng, dLat, dLng);
    roadKm = Math.max(1, Math.round(estimateRoadKm(straightKm) * 10) / 10);
    durationMin = estimateDurationMin(roadKm);
    durationText = formatDuration(durationMin);
  }

  var isIntercity = roadKm > 40;
  var pickupAddr = body.pickup_address || '';
  var dropoffAddr = body.dropoff_address || '';
  var providers = getProviders(pLat, pLng, dLat, dLng, pickupAddr, dropoffAddr);
  var grouped = buildResults(providers, roadKm, durationMin, isIntercity);

  res.status(200).json({
    status: 'success',
    currency_symbol: '\u20B9',
    distance_km: roadKm,
    duration_text: durationText,
    is_intercity: isIntercity,
    providers: grouped,
  });
}
