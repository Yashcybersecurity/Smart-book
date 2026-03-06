import React from 'react';

/**
 * RideCard – a single service/vehicle-type row within a provider group.
 * All data is read directly from the API JSON. Nothing is hardcoded.
 *
 * Props:
 *   service        – { id, type, icon, price, eta_minutes, surge_multiplier }
 *   provider       – { provider_name, ... } (used only for aria-label)
 *   currencySymbol – e.g. '₹'
 *   onBook         – click handler
 */
export default function RideCard({ service, provider, currencySymbol, onBook }) {
  const { type, icon, price, eta_text, surge_multiplier, desc } = service;

  // Format price like real apps: ₹5,549 (whole number, Indian format)
  const formattedPrice = `${currencySymbol}${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(price))}`;
  const hasSurge = surge_multiplier && surge_multiplier > 1;

  return (
    <div className="service-row">
      <span className="service-row__icon">{icon}</span>

      <div className="service-row__info">
        <div className="service-row__type">{type}</div>
        <div className="service-row__eta">
          ⏱ {eta_text}
          {hasSurge && (
            <span className="service-row__surge"> · {surge_multiplier.toFixed(1)}x</span>
          )}
        </div>
        {desc && <div className="service-row__desc">{desc}</div>}
      </div>

      <div className="service-row__price">{formattedPrice}</div>

      <button
        type="button"
        className="service-row__book-btn"
        onClick={onBook}
        aria-label={`Book ${provider.provider_name} ${type}`}
      >
        Book
      </button>
    </div>
  );
}
