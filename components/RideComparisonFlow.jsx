import React, { useEffect, useMemo, useRef, useState } from 'react';

/**
 * RideComparisonFlow.jsx
 * Production-ready ride comparison + booking flow component (mock fare fetch).
 *
 * Export: default RideComparisonFlow
 */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatINR(n) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${n}`;
  }
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    if (!signal) return;
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(t);
        reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }));
      },
      { once: true }
    );
  });
}

function getVehicleMeta(vehicleType) {
  const v = (vehicleType || 'bike').toLowerCase();
  const icon =
    v === 'bike' ? '🏍️' : v === 'auto' ? '🛺' : v === 'mini' ? '🚗' : v === 'sedan' ? '🚘' : v === 'car' ? '🚗' : '🚗';
  const label = v.charAt(0).toUpperCase() + v.slice(1);
  return { icon, label };
}

function getServiceDeepLink(serviceId, pickupLat, pickupLng, dropLat, dropLng, vehicleType) {
  const vt = (vehicleType || 'bike').toLowerCase();
  const uberProduct = vt === 'bike' ? 'moto' : vt === 'auto' ? 'auto' : vt === 'mini' ? 'uberx' : vt === 'sedan' ? 'uberx' : 'uberx';
  const deepLinks = {
    ola: `olacabs://deep_link?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&drop_lat=${dropLat}&drop_lng=${dropLng}&category=${vt}`,
    uber: `uber://deep_link?pickup_latitude=${pickupLat}&pickup_longitude=${pickupLng}&dropoff_latitude=${dropLat}&dropoff_longitude=${dropLng}&product_id=${uberProduct}`,
    rapido: `rapido://request?pickup_latitude=${pickupLat}&pickup_longitude=${pickupLng}&dropoff_latitude=${dropLat}&dropoff_longitude=${dropLng}&service_type=${vt.toUpperCase()}`,
    namma_yatri: `nammayatri://deep_link?pickup_latitude=${pickupLat}&pickup_longitude=${pickupLng}&dropoff_latitude=${dropLat}&dropoff_longitude=${dropLng}&category=${vt.toUpperCase()}`,
    quick_ride: `https://www.quickride.in/?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&dropoff_lat=${dropLat}&dropoff_lng=${dropLng}`,
  };
  return deepLinks[serviceId] || '';
}

function getWebFallback(serviceId, pickupLat, pickupLng, dropLat, dropLng, vehicleType) {
  const vt = (vehicleType || 'bike').toLowerCase();
  const uber = `https://m.uber.com/ul/?action=setPickupLocation&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${dropLat}&dropoff[longitude]=${dropLng}`;
  const ola = `https://book.olacabs.com/?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&drop_lat=${dropLat}&drop_lng=${dropLng}&category=${vt}`;
  const rapido = `https://www.rapido.bike/`;
  const namma = `https://nammayatri.in/`;
  const quick = `https://www.quickride.in/`;
  const map = { ola, uber, rapido, namma_yatri: namma, quick_ride: quick };
  return map[serviceId] || uber;
}

async function fetchLiveFares(pickupLat, pickupLng, dropLat, dropLng, vehicleType, signal) {
  // Simulate API latency (1-2 seconds)
  await sleep(1500, signal);

  const vt = (vehicleType || 'bike').toLowerCase();
  const fareMultiplier = vt === 'bike' ? 1 : vt === 'auto' ? 1.2 : vt === 'mini' ? 1.55 : vt === 'sedan' ? 1.8 : 1.8;
  const baseDistance =
    Math.sqrt(Math.pow(dropLat - pickupLat, 2) + Math.pow(dropLng - pickupLng, 2)) * 110; // rough km conversion

  const distanceKm = clamp(baseDistance, 1.2, 40);
  const mkFare = (rate, factor) => Math.round(distanceKm * rate * factor * fareMultiplier);
  const mkEta = (factor) => clamp(Math.ceil(distanceKm * factor + 2), 3, 60);

  const makeVehicle = (serviceId, name, rating, factor, deepLink) => {
    const est = mkFare(10, factor);
    const min = Math.round(est * 0.9);
    const max = Math.round(est * 1.12);
    return {
      vehicleType: vt,
      displayName: `${name} ${vt === 'bike' ? 'Bike' : vt === 'auto' ? 'Auto' : vt === 'mini' ? 'Mini' : vt === 'sedan' ? 'Sedan' : 'Car'}`,
      estimatedFare: formatINR(est),
      estimatedFareMin: min,
      estimatedFareMax: max,
      eta: `ETA: ${mkEta(1.45)} min`,
      etaMinutes: mkEta(1.45),
      rating,
      deepLink,
      available: true,
      serviceId,
    };
  };

  return [
    {
      id: 'rapido',
      name: 'Rapido',
      logo: 'https://rapido.bike/assets/images/rapido-logo.svg',
      highlighted: false,
      brandColor: '#FF6B35',
      vehicles: [
        makeVehicle(
          'rapido',
          'Rapido',
          4.6,
          0.9,
          `rapido://request?pickup_latitude=${pickupLat}&pickup_longitude=${pickupLng}&dropoff_latitude=${dropLat}&dropoff_longitude=${dropLng}&service_type=${vt.toUpperCase()}`
        ),
      ],
    },
    {
      id: 'ola',
      name: 'Ola',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Ola_Cabs_logo.svg',
      highlighted: true,
      brandColor: '#00A86B',
      vehicles: [
        makeVehicle(
          'ola',
          'Ola',
          4.8,
          0.95,
          `olacabs://deep_link?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&drop_lat=${dropLat}&drop_lng=${dropLng}&category=${vt}`
        ),
      ],
    },
    {
      id: 'uber',
      name: 'Uber',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
      highlighted: false,
      brandColor: '#000000',
      vehicles: [
        makeVehicle(
          'uber',
          'Uber',
          4.6,
          1.1,
          `https://m.uber.com/ul/?action=setPickupLocation&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${dropLat}&dropoff[longitude]=${dropLng}`
        ),
      ],
    },
    {
      id: 'namma_yatri',
      name: 'Namma Yatri',
      logo: 'https://nammayatri.in/assets/logo.svg',
      highlighted: false,
      brandColor: '#4CAF50',
      vehicles: [
        makeVehicle(
          'namma_yatri',
          'Namma Yatri',
          4.5,
          0.92,
          `nammayatri://deep_link?pickup_latitude=${pickupLat}&pickup_longitude=${pickupLng}&dropoff_latitude=${dropLat}&dropoff_longitude=${dropLng}&category=${vt.toUpperCase()}`
        ),
      ],
    },
    {
      id: 'quick_ride',
      name: 'Quick Ride',
      logo: 'https://www.quickride.in/static/media/logo.0b7dfc2e.png',
      highlighted: false,
      brandColor: '#6366F1',
      vehicles: [
        makeVehicle(
          'quick_ride',
          'Quick Ride',
          4.4,
          1.0,
          `https://www.quickride.in/?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&dropoff_lat=${dropLat}&dropoff_lng=${dropLng}`
        ),
      ],
    },
  ];
}

const styles = {
  wrap: { maxWidth: 1200, margin: '0 auto', padding: '0 16px' },
};

function Toast({ show, message, onClose }) {
  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 18,
        transform: 'translateX(-50%)',
        zIndex: 60,
        width: 'min(520px, calc(100% - 24px))',
        display: show ? 'block' : 'none',
      }}
    >
      <div
        role="status"
        style={{
          background: '#10B981',
          color: '#fff',
          padding: '12px 14px',
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 13 }}>{message}</div>
        <button
          onClick={onClose}
          aria-label="Close notification"
          style={{
            background: 'rgba(255,255,255,0.18)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            padding: '6px 10px',
            cursor: 'pointer',
            fontWeight: 900,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function LoadingOverlay({ show, message, onCancel }) {
  return (
    <div
      aria-hidden={!show}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        display: show ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(17,24,39,0.45)',
        backdropFilter: 'blur(6px)',
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Booking in progress"
        style={{
          width: 'min(520px, 100%)',
          background: '#fff',
          borderRadius: 16,
          padding: 18,
          boxShadow: '0 25px 60px rgba(0,0,0,0.22)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            aria-hidden="true"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: '3px solid #E5E7EB',
              borderTopColor: '#111827',
              animation: 'rcSpin 1s linear infinite',
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, color: '#111827' }}>Opening app…</div>
            <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 700, marginTop: 2 }}>{message}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button
            onClick={onCancel}
            style={{
              background: '#fff',
              border: '1px solid #D1D5DB',
              borderRadius: 12,
              padding: '10px 12px',
              cursor: 'pointer',
              fontWeight: 900,
              color: '#111827',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes rcSpin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function RideComparisonFlow({
  pickup,
  dropoff,
  pickupLat,
  pickupLng,
  dropLat,
  dropLng,
  vehicleType,
  distance,
  duration,
}) {
  const { icon: vehicleIcon, label: vehicleLabel } = getVehicleMeta(vehicleType);

  const [isLoading, setIsLoading] = useState(true); // fares loading
  const [selectedService, setSelectedService] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [rideOptions, setRideOptions] = useState([]);
  const [sortBy, setSortBy] = useState('cheapest'); // cheapest | fastest | rated
  const [sortDir, setSortDir] = useState('asc'); // asc | desc
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const bookingTimerRef = useRef({ t1: null, t2: null, t3: null });
  const abortRef = useRef(null);

  // Flatten options (one row per provider x option)
  const flatOptions = useMemo(() => {
    const out = [];
    for (const svc of rideOptions) {
      for (const v of svc.vehicles || []) out.push({ service: svc, option: v });
    }
    return out;
  }, [rideOptions]);

  const filteredFlatOptions = useMemo(() => {
    const vf = (vehicleFilter || 'all').toLowerCase();
    let list = flatOptions.filter((x) => x.option?.available);
    if (vf !== 'all') list = list.filter((x) => (x.option.vehicleType || '').toLowerCase() === vf);

    const getKey = (x) => {
      if (sortBy === 'fastest') return x.option.etaMinutes ?? 9999;
      if (sortBy === 'rated') return x.option.rating ?? 0;
      // cheapest
      return x.option.estimatedFareMin ?? x.option.estimatedFareMax ?? 999999;
    };

    const dir = sortDir === 'desc' ? -1 : 1;
    return [...list].sort((a, b) => {
      const ka = getKey(a);
      const kb = getKey(b);
      if (ka < kb) return -1 * dir;
      if (ka > kb) return 1 * dir;
      // tie-breaker: Ola first if highlighted
      if (a.service.highlighted && !b.service.highlighted) return -1;
      if (!a.service.highlighted && b.service.highlighted) return 1;
      return 0;
    });
  }, [flatOptions, vehicleFilter, sortBy, sortDir]);

  const distanceText = useMemo(() => {
    if (typeof distance === 'number' && Number.isFinite(distance)) return `${distance.toFixed(1)} km`;
    // derive rough distance from coords as fallback (Chennai context)
    const base = Math.sqrt(Math.pow(dropLat - pickupLat, 2) + Math.pow(dropLng - pickupLng, 2)) * 110;
    return `${clamp(base, 1.2, 40).toFixed(1)} km`;
  }, [distance, dropLat, dropLng, pickupLat, pickupLng]);

  const durationText = useMemo(() => {
    if (typeof duration === 'number' && Number.isFinite(duration)) return `${Math.round(duration)} mins`;
    const base = Math.sqrt(Math.pow(dropLat - pickupLat, 2) + Math.pow(dropLng - pickupLng, 2)) * 110;
    const mins = clamp(Math.ceil(clamp(base, 1.2, 40) * 1.5), 5, 75);
    return `${mins} mins`;
  }, [duration, dropLat, dropLng, pickupLat, pickupLng]);

  // Fetch fares on mount and when key inputs change
  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setApiError(null);

    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetchLiveFares(pickupLat, pickupLng, dropLat, dropLng, vehicleType, controller.signal)
      .then((services) => {
        setRideOptions(services);
        // default sort: cheapest asc
        setSortBy('cheapest');
        setSortDir('asc');
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          setApiError('Request timed out. Please check your connection.');
        } else {
          setApiError('Unable to fetch fares. Please try again.');
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setIsLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [pickupLat, pickupLng, dropLat, dropLng, vehicleType, retryCount]);

  // Escape closes overlay
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && selectedService) cancelBooking();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  const highlightedServiceId = useMemo(() => {
    const ola = rideOptions.find((s) => s.id === 'ola');
    return ola?.id || rideOptions.find((s) => s.highlighted)?.id || null;
  }, [rideOptions]);

  function cancelBooking() {
    setSelectedService(null);
    setLoadingMessage('');
    const { t1, t2, t3 } = bookingTimerRef.current;
    if (t1) clearTimeout(t1);
    if (t2) clearTimeout(t2);
    if (t3) clearTimeout(t3);
    bookingTimerRef.current = { t1: null, t2: null, t3: null };
  }

  function startBooking(serviceId, option) {
    setSelectedService(serviceId);
    const msg = `Opening ${option.displayName}… Prefilling ${pickup} → ${dropoff}`;
    setLoadingMessage(msg);

    const deepLink = getServiceDeepLink(serviceId, pickupLat, pickupLng, dropLat, dropLng, vehicleType);
    const fallback = getWebFallback(serviceId, pickupLat, pickupLng, dropLat, dropLng, vehicleType);

    // Step 3: deep link after 1.5s
    const t1 = setTimeout(() => {
      // Attempt to open app
      window.location.href = deepLink;

      // Success toast quickly (best-effort UX)
      const t2 = setTimeout(() => {
        setSuccessMessage(`✅ ${option.displayName} opened with your details! (Confirm pickup/dropoff in the app)`);
        setShowSuccessToast(true);
        const t3 = setTimeout(() => setShowSuccessToast(false), 3000);
        bookingTimerRef.current.t3 = t3;
      }, 300);

      bookingTimerRef.current.t2 = t2;

      // Fallback to web after 3s if app didn’t open
      const tFallback = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          // likely not installed (or blocked), open web fallback
          window.open(fallback, '_blank', 'noopener,noreferrer');
        }
        // always cleanup overlay after fallback attempt
        cancelBooking();
      }, 3000);

      bookingTimerRef.current.t3 = tFallback;
    }, 1500);

    bookingTimerRef.current.t1 = t1;
  }

  const vehicleFilters = useMemo(() => {
    const base = ['all', 'bike', 'auto', 'car', 'mini', 'sedan'];
    return base;
  }, []);

  const sortPresets = [
    { id: 'cheapest', label: 'Cheapest' },
    { id: 'fastest', label: 'Fastest' },
    { id: 'rated', label: 'Best Rated' },
  ];

  return (
    <div>
      {/* Sticky header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#fff',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ ...styles.wrap, paddingTop: 12, paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, color: '#111827', fontSize: 14 }}>
                <span title="Pickup" aria-label="Pickup location">
                  📍 {pickup}
                </span>
                <span aria-hidden="true">→</span>
                <span title="Dropoff" aria-label="Dropoff location">
                  📍 {dropoff}
                </span>
                <span style={{ color: '#6B7280', fontWeight: 800 }}> | </span>
                <span aria-label={`Selected vehicle type ${vehicleLabel}`}>
                  {vehicleIcon} {vehicleLabel} Mode
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#6B7280', fontWeight: 700 }}>
                Distance: {distanceText} &nbsp; | &nbsp; Est. Duration: {durationText}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => window.history.back()}
                aria-label="Change pickup, dropoff or vehicle"
                style={{
                  border: '1px solid #D1D5DB',
                  background: '#fff',
                  padding: '10px 12px',
                  borderRadius: 12,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                🔄 Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ ...styles.wrap, marginTop: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {sortPresets.map((s) => {
              const active = sortBy === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSortBy(s.id);
                    // default directions
                    setSortDir(s.id === 'rated' ? 'desc' : 'asc');
                  }}
                  aria-label={`Sort by ${s.label}`}
                  style={{
                    border: `1px solid ${active ? '#111827' : '#D1D5DB'}`,
                    background: active ? '#111827' : '#fff',
                    color: active ? '#fff' : '#111827',
                    padding: '9px 12px',
                    borderRadius: 999,
                    fontWeight: 900,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: '#111827' }}>Direction</div>
            <button
              type="button"
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              aria-label={`Toggle sort direction (currently ${sortDir})`}
              style={{
                border: '1px solid #D1D5DB',
                background: '#fff',
                padding: '10px 12px',
                borderRadius: 12,
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#111827' }}>Filters:</div>
          {vehicleFilters.map((vf) => {
            const active = vehicleFilter === vf;
            return (
              <button
                key={vf}
                type="button"
                onClick={() => setVehicleFilter(vf)}
                aria-label={`Filter by ${vf}`}
                style={{
                  border: `1px solid ${active ? 'rgba(0,168,107,0.55)' : '#D1D5DB'}`,
                  background: active ? 'rgba(0,168,107,0.08)' : '#fff',
                  color: active ? '#00A86B' : '#111827',
                  padding: '9px 12px',
                  borderRadius: 999,
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {vf === 'all' ? 'All' : vf.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ ...styles.wrap, marginTop: 14, paddingBottom: 40 }}>
        {apiError ? (
          <div
            role="alert"
            style={{
              background: '#fff',
              border: '1px solid #FCA5A5',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontWeight: 900, color: '#991B1B' }}>⏱️ {apiError}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {retryCount < 3 ? (
                <button
                  type="button"
                  onClick={() => setRetryCount((c) => c + 1)}
                  style={{
                    background: '#111827',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  Retry ({retryCount}/3)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setApiError(null);
                    setRideOptions([]);
                  }}
                  style={{
                    background: '#fff',
                    color: '#111827',
                    border: '1px solid #D1D5DB',
                    borderRadius: 12,
                    padding: '10px 12px',
                    fontWeight: 900,
                    cursor: 'pointer',
                  }}
                >
                  Use default fares
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* Loading state */}
        {isLoading ? (
          <div aria-busy="true" style={{ marginTop: 10 }}>
            <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 800, marginBottom: 12 }}>
              Fetching latest fares from Ola, Uber, Rapido, Namma Yatri…
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <div style={{ height: 12, width: '46%', background: '#EEF2F7', borderRadius: 999 }} />
                  <div style={{ height: 10 }} />
                  <div style={{ height: 12, width: '28%', background: '#EEF2F7', borderRadius: 999 }} />
                  <div style={{ height: 14 }} />
                  <div style={{ height: 40, width: '100%', background: '#EEF2F7', borderRadius: 12 }} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Empty state */}
        {!isLoading && !apiError && filteredFlatOptions.length === 0 ? (
          <div
            style={{
              marginTop: 14,
              background: '#fff',
              border: '1px dashed rgba(17,24,39,0.25)',
              borderRadius: 16,
              padding: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 34 }}>🛺</div>
            <div style={{ marginTop: 10, fontWeight: 900, color: '#111827' }}>No rides available for this mode right now.</div>
            <div style={{ marginTop: 6, fontSize: 13, fontWeight: 700, color: '#6B7280' }}>
              Try switching vehicle type or changing pickup/drop.
            </div>
          </div>
        ) : null}

        {/* Mobile cards */}
        {!isLoading && !apiError ? (
          <div className="rcMobileCards" style={{ marginTop: 14, display: 'grid', gap: 12 }}>
            {filteredFlatOptions.map(({ service, option }) => {
              const isOla = service.id === 'ola';
              const borderTop = isOla ? `4px solid ${service.brandColor}` : '1px solid #E5E7EB';
              return (
                <div
                  key={`${service.id}-${option.vehicleType}`}
                  style={{
                    background: '#fff',
                    border: '1px solid #E5E7EB',
                    borderTop,
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        aria-hidden="true"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: service.brandColor,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                        }}
                      >
                        {service.name.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 900, color: '#111827' }}>
                          {service.id === 'rapido' ? '🟠' : service.id === 'ola' ? '🟢' : service.id === 'uber' ? '⚫' : '🟩'}{' '}
                          {option.displayName}
                        </div>
                        {service.highlighted ? (
                          <div style={{ fontSize: 12, color: '#00A86B', fontWeight: 900 }}>Recommended</div>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, fontSize: 20, color: '#111827' }}>{option.estimatedFare}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#6B7280' }}>
                        Range: {formatINR(option.estimatedFareMin)}–{formatINR(option.estimatedFareMax)}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{option.eta}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>
                      Rating: {option.rating} <span aria-hidden="true">⭐</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => startBooking(service.id, option)}
                      aria-label={`Book on ${service.name}`}
                      style={{
                        width: '100%',
                        background: service.id === 'uber' ? '#000' : service.brandColor,
                        color: service.id === 'uber' ? '#fff' : '#fff',
                        border: 'none',
                        borderRadius: 12,
                        padding: '12px 12px',
                        fontWeight: 1000,
                        cursor: 'pointer',
                      }}
                    >
                      BOOK ON {service.name.toUpperCase()}
                    </button>
                    <div style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#6B7280' }}>
                      Opens official app to complete payment
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Desktop table */}
        {!isLoading && !apiError ? (
          <div className="rcDesktopTable" style={{ marginTop: 16 }}>
            <div
              style={{
                display: 'none',
                background: '#fff',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid #E5E7EB',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              }}
              className="rcTableWrap"
            >
              <table role="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#111827' }}>
                  <tr role="row">
                    {['Provider', 'Vehicle', 'Fare', 'ETA', 'Rating', 'Action'].map((h) => (
                      <th
                        key={h}
                        role="columnheader"
                        style={{
                          color: '#fff',
                          textAlign: 'left',
                          fontSize: 12,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          padding: '14px 16px',
                          fontWeight: 900,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFlatOptions.map(({ service, option }) => {
                    const olaRow = service.id === 'ola';
                    return (
                      <tr
                        key={`row-${service.id}-${option.vehicleType}`}
                        role="row"
                        style={{
                          background: olaRow ? '#F0FAF7' : '#fff',
                          borderBottom: '1px solid #E5E7EB',
                        }}
                      >
                        <td role="cell" style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div
                              aria-hidden="true"
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: service.brandColor,
                                color: service.id === 'ola' ? '#fff' : '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 900,
                              }}
                            >
                              {service.name.charAt(0)}
                            </div>
                            <div style={{ fontWeight: 900, color: '#111827' }}>{service.name}</div>
                          </div>
                        </td>
                        <td role="cell" style={{ padding: '14px 16px', fontWeight: 800, color: '#111827' }}>
                          {option.displayName}
                        </td>
                        <td role="cell" style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 1000, color: '#111827', fontSize: 18 }}>{option.estimatedFare}</div>
                          <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700 }}>
                            Range: {formatINR(option.estimatedFareMin)}–{formatINR(option.estimatedFareMax)}
                          </div>
                        </td>
                        <td role="cell" style={{ padding: '14px 16px', fontWeight: 900, color: '#111827' }}>
                          {option.eta}
                        </td>
                        <td role="cell" style={{ padding: '14px 16px', fontWeight: 900, color: '#111827' }}>
                          {option.rating} <span aria-hidden="true">⭐</span>
                        </td>
                        <td role="cell" style={{ padding: '14px 16px' }}>
                          <button
                            type="button"
                            onClick={() => startBooking(service.id, option)}
                            aria-label={`Book on ${service.name}`}
                            style={{
                              width: 220,
                              maxWidth: '100%',
                              background: service.id === 'uber' ? '#000' : service.brandColor,
                              color: '#fff',
                              border: 'none',
                              borderRadius: 12,
                              padding: '12px 12px',
                              fontWeight: 1000,
                              cursor: 'pointer',
                            }}
                          >
                            BOOK ON {service.name.toUpperCase()}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <style jsx>{`
              /* mobile-first: show cards; desktop: show table */
              @media (min-width: 768px) {
                .rcMobileCards {
                  display: none !important;
                }
                .rcTableWrap {
                  display: block !important;
                }
              }
            `}</style>
          </div>
        ) : null}

        {/* Bottom info */}
        <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280' }}>
            All fares are estimates. Final fare may differ in the provider app.
          </div>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563EB',
              fontWeight: 900,
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 10,
            }}
            aria-label="View previous searches"
          >
            View previous searches
          </button>
        </div>
      </div>

      <LoadingOverlay show={!!selectedService} message={loadingMessage} onCancel={cancelBooking} />
      <Toast show={showSuccessToast} message={successMessage} onClose={() => setShowSuccessToast(false)} />
    </div>
  );
}

