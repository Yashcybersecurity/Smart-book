import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const PROVIDER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'uber', label: 'Uber' },
  { id: 'ola', label: 'Ola' },
  { id: 'rapido', label: 'Rapido' },
  { id: 'nammayatri', label: 'Namma Yatri' },
];

const PROVIDER_COLORS = {
  uber: '#000', ola: '#1C8F3C', rapido: '#FECE00', nammayatri: '#5B21B6',
};
const PROVIDER_TEXT = {
  uber: '#fff', ola: '#fff', rapido: '#111', nammayatri: '#fff',
};

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function HistoryPage() {
  const { user } = useAuth();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchRides = useCallback(async (opts = {}) => {
    if (!user) return;
    const { append = false, startAfter = null } = opts;

    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ limit: '20' });
      if (startAfter) params.set('startAfter', startAfter);

      const res = await fetch(`/api/rides/history?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setRides(prev => append ? [...prev, ...data.rides] : data.rides);
      setLastTimestamp(data.lastTimestamp);
      setHasMore(data.hasMore);
      setError('');
    } catch {
      setError('Could not load ride history. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  // Tab change is client-side only — no re-fetch
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleLoadMore = () => {
    fetchRides({ append: true, startAfter: lastTimestamp });
  };

  // Client-side filter by provider tab and date range
  const filtered = rides.filter(r => {
    if (activeTab !== 'all' && r.provider !== activeTab) return false;
    if (!r.timestamp) return true;
    const ts = new Date(r.timestamp);
    if (dateFrom && ts < new Date(dateFrom)) return false;
    if (dateTo && ts > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  return (
    <div className="history-page">
      <header className="dash-header">
        <span className="dash-logo">🚕 FAREXO</span>
        <nav className="dash-nav">
          <Link href="/dashboard" className="dash-nav-link">← Dashboard</Link>
          <Link href="/profile" className="dash-nav-link">Profile</Link>
        </nav>
      </header>

      <main className="history-main">
        <h1 className="history-title">Ride History</h1>

        {/* Provider filter tabs */}
        <div className="history-tabs" role="tablist">
          {PROVIDER_TABS.map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`history-tab${activeTab === tab.id ? ' history-tab--active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="history-date-filter">
          <label>From
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </label>
          <label>To
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </label>
          {(dateFrom || dateTo) && (
            <button className="history-clear-date" onClick={() => { setDateFrom(''); setDateTo(''); }}>
              Clear dates
            </button>
          )}
        </div>

        {error && <div className="dash-state-error">{error}</div>}

        {loading ? (
          <div className="history-skeleton">
            {[0, 1, 2].map(i => (
              <div key={i} className="history-skeleton-item shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="history-empty">
            <p>No rides found{activeTab !== 'all' ? ` for ${activeTab}` : ''}.</p>
          </div>
        ) : (
          <div className="history-timeline">
            {filtered.map(ride => {
              const bg = PROVIDER_COLORS[ride.provider] || '#6b7280';
              const fg = PROVIDER_TEXT[ride.provider] || '#fff';
              return (
                <div key={ride.id} className="history-item">
                  <div className="history-item__dot" style={{ background: bg }} />
                  <div className="history-item__card">
                    <div className="history-item__top">
                      <span
                        className="history-item__badge"
                        style={{ background: bg, color: fg }}
                      >
                        {ride.provider}
                      </span>
                      <span className="history-item__vehicle">{ride.vehicleType}</span>
                      <span
                        className={`history-item__status history-item__status--${ride.status}`}
                      >
                        {ride.status}
                      </span>
                    </div>
                    <div className="history-item__route">
                      <span className="history-item__from">{ride.fromAddress || '—'}</span>
                      <span className="history-item__arrow">→</span>
                      <span className="history-item__to">{ride.toAddress || '—'}</span>
                    </div>
                    <div className="history-item__bottom">
                      <span className="history-item__fare">{ride.fareEstimate || '—'}</span>
                      <span className="history-item__date">{formatDate(ride.timestamp)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="history-load-more">
            <button
              className="auth-btn-primary"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
