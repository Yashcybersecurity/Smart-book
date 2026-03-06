import React, { useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PROVIDER_LOGOS = {
  uber: { bg: '#000', text: '#fff', label: 'Uber' },
  ola: { bg: '#1C8F3C', text: '#fff', label: 'Ola' },
  rapido: { bg: '#FECE00', text: '#111', label: 'Rapido' },
  nammayatri: { bg: '#5B21B6', text: '#fff', label: 'NY' },
};

function SkeletonVehicleRow() {
  return (
    <div className="pc-vehicle-row pc-vehicle-row--skeleton">
      <div className="pc-skel pc-skel--icon shimmer" />
      <div className="pc-skel-info">
        <div className="pc-skel pc-skel--text shimmer" style={{ width: '55%' }} />
        <div className="pc-skel pc-skel--text shimmer" style={{ width: '35%', marginTop: 4 }} />
      </div>
      <div className="pc-skel pc-skel--price shimmer" />
      <div className="pc-skel pc-skel--btn shimmer" />
    </div>
  );
}

function VehicleRow({ vehicle, onBook }) {
  const handleBook = useCallback(async () => {
    await onBook(vehicle);
    if (!vehicle.deepLink) return;
    // Smart redirect: try native app, fallback to web after 1.5s
    window.location.href = vehicle.deepLink;
    setTimeout(() => {
      if (!document.hidden) {
        window.location.href = vehicle.webFallback || vehicle.deepLink;
      }
    }, 1500);
  }, [vehicle, onBook]);

  return (
    <div className="pc-vehicle-row">
      <span className="pc-vehicle-icon" aria-hidden="true">{vehicle.icon}</span>
      <div className="pc-vehicle-info">
        <span className="pc-vehicle-type">{vehicle.type}</span>
        <span className="pc-vehicle-eta">{vehicle.eta_text}</span>
      </div>
      <div className="pc-vehicle-price">
        {vehicle.fallback ? (
          <span className="pc-fare-app">See in app</span>
        ) : (
          <span className="pc-fare">{vehicle.fare}</span>
        )}
      </div>
      <button
        className="pc-book-btn"
        onClick={handleBook}
        disabled={!vehicle.deepLink && !vehicle.webFallback}
        title={!vehicle.deepLink && !vehicle.webFallback ? 'Location data missing — cannot open app' : `Book ${vehicle.type}`}
      >
        Book
      </button>
    </div>
  );
}

export function ProviderCard({ providerId, state, pickup, dropoff, onBook }) {
  const logo = PROVIDER_LOGOS[providerId] || { bg: '#6b7280', text: '#fff', label: '?' };
  const { loading, data, error } = state;
  const providerName = data?.providerName || logo.label;

  return (
    <div className="provider-card" style={{ '--pc-color': logo.bg }}>
      <div className="provider-card__header">
        <div
          className="provider-card__logo"
          style={{ background: logo.bg, color: logo.text }}
        >
          {logo.label}
        </div>
        <span className="provider-card__name">{providerName}</span>
        {data?.isEstimated && (
          <span className="provider-card__badge">Est.</span>
        )}
      </div>

      <div className="provider-card__body">
        {loading && [0, 1, 2].map(i => <SkeletonVehicleRow key={i} />)}
        {!loading && error && (
          <div className="provider-card__error">
            <span>⚠️ {error}</span>
          </div>
        )}
        {!loading && data?.vehicles?.map(v => (
          <VehicleRow key={v.type} vehicle={v} onBook={onBook} />
        ))}
      </div>
    </div>
  );
}
