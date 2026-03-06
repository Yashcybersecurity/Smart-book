import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { ProviderCard } from '../components/ProviderCard';

// Load SearchForm without SSR (uses Google Maps)
const SearchForm = dynamic(() => import('../components/SearchForm'), { ssr: false });

const PROVIDERS = ['uber', 'ola', 'rapido', 'nammayatri'];

const INITIAL_PROVIDER_STATE = Object.fromEntries(
  PROVIDERS.map(p => [p, { loading: false, data: null, error: null }])
);

export default function DashboardPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading, signOut } = useAuth();

  const [routeData, setRouteData] = useState(null);
  const [providerStates, setProviderStates] = useState(INITIAL_PROVIDER_STATE);
  const [stateError, setStateError] = useState('');
  const [searching, setSearching] = useState(false);
  const [allFailed, setAllFailed] = useState(false);
  const [toast, setToast] = useState('');

  // Redirect to onboarding if homeState missing
  useEffect(() => {
    if (!authLoading && userData && !userData.homeState) {
      router.push('/onboarding');
    }
  }, [authLoading, userData, router]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const fetchProvider = useCallback(async (providerId, pickup, dropoff, token) => {
    try {
      const res = await fetch('/api/rides/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ provider: providerId, from: pickup, to: dropoff }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProviderStates(prev => ({
        ...prev,
        [providerId]: { loading: false, data, error: null },
      }));
      return { ok: true };
    } catch (e) {
      setProviderStates(prev => ({
        ...prev,
        [providerId]: { loading: false, data: null, error: 'Could not fetch fares' },
      }));
      return { ok: false };
    }
  }, []);

  const handleSearch = useCallback(async ({ pickup, dropoff }) => {
    setStateError('');
    setAllFailed(false);
    setSearching(true);
    setRouteData(null);

    const token = await user.getIdToken();

    // State validation
    const valRes = await fetch('/api/rides/validate-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fromLat: pickup.lat, fromLng: pickup.lng,
        toLat: dropoff.lat, toLng: dropoff.lng,
      }),
    });
    const valData = await valRes.json();

    setSearching(false);

    if (!valData.valid) {
      if (valData.reason === 'no_home_state') {
        router.push('/onboarding');
        return;
      }
      setStateError(valData.message || 'Location outside home state.');
      return;
    }

    if (userData?.preferredProviders?.length === 0) {
      setStateError('No providers selected. Update preferences in your profile.');
      return;
    }

    const activeProviders = userData?.preferredProviders || PROVIDERS;

    // Show cards with loading state
    setRouteData({ pickup, dropoff });
    setProviderStates(
      Object.fromEntries(
        PROVIDERS.map(p => [
          p,
          activeProviders.includes(p)
            ? { loading: true, data: null, error: null }
            : { loading: false, data: null, error: null, skipped: true },
        ])
      )
    );

    // Fetch all active providers in parallel — each updates its card independently
    const results = await Promise.allSettled(
      activeProviders.map(p => fetchProvider(p, pickup, dropoff, token))
    );

    const allFail = results.every(r => r.status === 'rejected' || r.value?.ok === false);
    if (allFail) setAllFailed(true);
  }, [user, userData, router, fetchProvider]);

  const handleBook = useCallback(async (vehicle) => {
    if (!routeData || !user) return;
    const token = await user.getIdToken();
    try {
      await fetch('/api/rides/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          provider: vehicle.providerId || '',
          vehicleType: vehicle.type,
          fareEstimate: vehicle.fare,
          fareRaw: vehicle.fareRaw,
          fromAddress: routeData.pickup.address,
          fromLat: routeData.pickup.lat,
          fromLng: routeData.pickup.lng,
          toAddress: routeData.dropoff.address,
          toLat: routeData.dropoff.lat,
          toLng: routeData.dropoff.lng,
          deepLink: vehicle.deepLink,
          webFallback: vehicle.webFallback,
        }),
      });
      showToast('Ride logged ✓');
    } catch { /* non-critical */ }
  }, [routeData, user, showToast]);

  const handleRetry = useCallback(() => {
    if (routeData) handleSearch(routeData);
  }, [routeData, handleSearch]);

  const handleBack = useCallback(() => {
    setRouteData(null);
    setStateError('');
    setAllFailed(false);
    setProviderStates(INITIAL_PROVIDER_STATE);
  }, []);

  if (authLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dash-header">
        <span className="dash-logo">🚕 FAREXO</span>
        <nav className="dash-nav">
          <Link href="/history" className="dash-nav-link">History</Link>
          <Link href="/profile" className="dash-nav-link">Profile</Link>
          <button onClick={signOut} className="dash-nav-link dash-nav-link--signout">
            Sign Out
          </button>
        </nav>
      </header>

      <main className="dash-main">
        {/* ── Search section ── */}
        {!routeData && (
          <div className="dash-search-wrap">
            {userData?.homeState && (
              <p className="dash-state-hint">
                Searching within <strong>{userData.homeState}</strong>
              </p>
            )}
            {stateError && (
              <div className="dash-state-error" role="alert">
                ⚠️ {stateError}
              </div>
            )}
            {searching && (
              <div className="dash-validating">Validating locations…</div>
            )}
            <SearchForm onSearch={handleSearch} />
          </div>
        )}

        {/* ── Provider grid ── */}
        {routeData && (
          <div className="dash-results">
            <div className="dash-results__topbar">
              <button onClick={handleBack} className="dash-back-btn">← Edit search</button>
              <div className="dash-route-summary">
                <span className="dash-route-from">{routeData.pickup.address}</span>
                <span className="dash-route-arrow">→</span>
                <span className="dash-route-to">{routeData.dropoff.address}</span>
              </div>
            </div>

            {allFailed ? (
              <div className="dash-all-failed">
                <p>All providers failed to respond.</p>
                <button onClick={handleRetry} className="auth-btn-primary">Retry</button>
              </div>
            ) : (
              <div className="provider-grid">
                {PROVIDERS.map(pid => {
                  const state = providerStates[pid];
                  if (state.skipped) return null;
                  // Attach providerId to each vehicle for logging
                  const enrichedState = state.data
                    ? {
                        ...state,
                        data: {
                          ...state.data,
                          vehicles: state.data.vehicles.map(v => ({ ...v, providerId: pid })),
                        },
                      }
                    : state;
                  return (
                    <ProviderCard
                      key={pid}
                      providerId={pid}
                      state={enrichedState}
                      pickup={routeData.pickup}
                      dropoff={routeData.dropoff}
                      onBook={handleBook}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
