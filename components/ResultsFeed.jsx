import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDeviceDetect } from '../hooks/useAppHooks';
import RideCard from './RideCard';

/**
 * ResultsFeed – "Page 2" of the PWA.
 * Fetches ride data from the middleware API, renders results GROUPED BY PROVIDER.
 * Each provider section shows only its real vehicle types from the API.
 * Zero hardcoded provider names, logos, vehicle types, or prices.
 */
export default function ResultsFeed({ pickup, dropoff, onBack }) {
  const { isMobile } = useDeviceDetect();

  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('cheapest');
  const [redirecting, setRedirecting] = useState(null);
  const [collapsedProviders, setCollapsedProviders] = useState({});

  // Fetch rides from middleware
  const fetchRides = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/search-rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          pickup_address: pickup.address || '',
          dropoff_lat: dropoff.lat,
          dropoff_lng: dropoff.lng,
          dropoff_address: dropoff.address || '',
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();

      if (data.status !== 'success') {
        throw new Error(data.message || 'Unknown error from server.');
      }

      setApiData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch rides. Please try again.');
    } finally {
      setLoading(false);
    }
   }, [pickup, dropoff]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  // Sort services within each provider group
  const sortedProviders = useMemo(() => {
    if (!apiData?.providers) return [];
    return apiData.providers.map((provider) => {
      const sorted = [...provider.services];
      if (sortBy === 'cheapest') sorted.sort((a, b) => a.price - b.price);
      else if (sortBy === 'fastest') sorted.sort((a, b) => a.eta_minutes - b.eta_minutes);
      return { ...provider, services: sorted };
    });
  }, [apiData, sortBy]);

  // Total ride count across all providers
  const totalRides = useMemo(
    () => sortedProviders.reduce((sum, p) => sum + p.services.length, 0),
    [sortedProviders]
  );

  // Cheapest service per provider (for the provider header)
  const cheapestPerProvider = useMemo(() => {
    const map = {};
    for (const p of sortedProviders) {
      if (p.services.length > 0) {
        map[p.provider_id] = Math.min(...p.services.map((s) => s.price));
      }
    }
    return map;
  }, [sortedProviders]);

  // Toggle collapse for a provider section
  const toggleProvider = (providerId) => {
    setCollapsedProviders((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  /**

  leBookingClick – the "Smart Redirect" (invisible router).
   * Mobile: try app deep-link, fall back to web after 2s.
   * Desktop: open web_fallback directly in new tab.
   */
  const handleBookingClick = useCallback(
    (provider, service) => {
      const { action_urls, provider_name } = provider;
      setRedirecting(`Opening ${provider_name} ${service.type}…`);

      if (isMobile) {
        window.location.href = action_urls.mobile_scheme;
        const fallbackTimer = setTimeout(() => {
          if (document.visibilityState === 'visible') {
            window.open(action_urls.web_fallback, '_blank', 'noopener,noreferrer');
          }
          setRedirecting(null);
        }, 2000);

        const onVisChange = () => {
          if (document.visibilityState === 'hidden') {
            clearTimeout(fallbackTimer);
            setTimeout(() => setRedirecting(null), 500);
          }
        };
        document.addEventListener('visibilitychange', onVisChange, { once: true });
      } else {
        window.open(action_urls.web_fallback, '_blank', 'noopener,noreferrer');
        setTimeout(() => setRedirecting(null), 800);
      }
    },
    [isMobile]
  );

  // --- Rendering ---

  if (loading) {
    return (
      <div className="results-feed">
        <div className="results-feed__header">
          <button type="button" className="results-feed__back" onClick={onBack}>
            ← Back
          </button>
          <h2 className="results-feed__title">Finding rides…</h2>
        </div>
        <div className="results-feed__loading" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-provider">
              <div className="skeleton-line skeleton-line--logo" />
              <div className="skeleton-line skeleton-line--long" />
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-line skeleton-line--short" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-feed">
        <div className="results-feed__header">
          <button type="button" className="results-feed__back" onClick={onBack}>
            ← Back
          </button>
          <h2 className="results-feed__title">Something went wrong</h2>
        </div>
        <div className="results-feed__error" role="alert">
          <p>{error}</p>
          <button type="button" className="results-feed__retry" onClick={fetchRides}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-feed">
      {/* Header */}
      <div className="results-feed__header">
        <button type="button" className="results-feed__back" onClick={onBack}>
          ← Back
        </button>
        <div className="results-feed__route">
          <span className="results-feed__route-addr">{pickup.address}</span>
          <span className="results-feed__arrow">→</span>
          <span className="results-feed__route-addr">{dropoff.address}</span>
        </div>
      </div>

      {/* Sort controls */}
      <div className="results-feed__sort-bar">
        <span className="results-feed__sort-label">Sort by:</span>
        {[
          { id: 'cheapest', label: 'Cheapest' },
          { id: 'fastest', label: 'Fastest' },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            className={`results-feed__sort-btn ${sortBy === s.id ? 'results-feed__sort-btn--active' : ''}`}
            onClick={() => setSortBy(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Trip info bar */}
      <div className="results-feed__trip-info">
        <span>📏 {apiData.distance_km} km</span>
        <span>⏱ {apiData.duration_text}</span>
        {apiData.is_intercity && <span className="results-feed__intercity-badge">Outstation</span>}
      </div>

      {/* Provider count */}
      <div className="results-feed__count">
        {sortedProviders.length} app{sortedProviders.length !== 1 ? 's' : ''} · {totalRides} ride
        {totalRides !== 1 ? 's' : ''} found
      </div>

      {/* Grouped provider cards */}
      <div className="results-feed__providers">
        {sortedProviders.map((provider) => {
          const isCollapsed = collapsedProviders[provider.provider_id];
          const cheapest = cheapestPerProvider[provider.provider_id];

          return (
            <div key={provider.provider_id} className="provider-group">
              {/* Provider header – click to expand/collapse */}
              <button
                type="button"
                className="provider-group__header"
                onClick={() => toggleProvider(provider.provider_id)}
                aria-expanded={!isCollapsed}
              >
                <div className="provider-group__logo-wrap">
                  <img
                    src={provider.logo}
                    alt={`${provider.provider_name} logo`}
                    className="provider-group__logo"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="provider-group__logo-fallback"
                    style={{ display: 'none', background: provider.color || 'var(--color-primary)' }}
                  >
                    {provider.provider_name.charAt(0)}
                  </div>
                </div>

                <div className="provider-group__info">
                  <div className="provider-group__name">{provider.provider_name}</div>
                  <div className="provider-group__meta">
                    {provider.service_count} vehicle type{provider.service_count !== 1 ? 's' : ''}
                    {cheapest != null && (
                      <> · from <strong>{apiData.currency_symbol}{new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(cheapest))}</strong></>
                    )}
                  </div>
                </div>

                <span className={`provider-group__chevron ${isCollapsed ? '' : 'provider-group__chevron--open'}`}>
                  ▸
                </span>
              </button>

              {/* Service rows – only real vehicle types from this provider's API data */}
              {!isCollapsed && (
                <div className="provider-group__services">
                  {provider.services.map((svc) => (
                    <RideCard
                      key={svc.id}
                      service={svc}
                      provider={provider}
                      currencySymbol={apiData.currency_symbol}
                      onBook={() => handleBookingClick(provider, svc)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="results-feed__disclaimer">
        All fares are estimates. Final fare is determined by the provider's app.
      </p>

      {/* Redirect overlay */}
      {redirecting && (
        <div className="redirect-overlay">
          <div className="redirect-overlay__card">
            <div className="redirect-overlay__spinner" />
            <p className="redirect-overlay__text">{redirecting}</p>
            <button
              type="button"
              className="redirect-overlay__cancel"
              onClick={() => setRedirecting(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
