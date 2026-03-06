import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const ALL_PROVIDERS = [
  { id: 'uber', label: 'Uber' },
  { id: 'ola', label: 'Ola' },
  { id: 'rapido', label: 'Rapido' },
  { id: 'nammayatri', label: 'Namma Yatri' },
];

export default function ProfilePage() {
  const { user, userData, refreshUserData } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homeState, setHomeState] = useState('');
  const [preferredProviders, setPreferredProviders] = useState(['uber', 'ola', 'rapido', 'nammayatri']);
  const [rideCounts, setRideCounts] = useState({});

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Pre-fill form from userData
  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName || '');
      setPhoneNumber(userData.phoneNumber || '');
      setHomeState(userData.homeState || '');
      setPreferredProviders(userData.preferredProviders || ['uber', 'ola', 'rapido', 'nammayatri']);
    }
  }, [userData]);

  // Fetch ride counts per provider (client-side aggregation)
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/rides/history?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const counts = {};
        (data.rides || []).forEach(r => {
          if (r.provider) counts[r.provider] = (counts[r.provider] || 0) + 1;
        });
        // Mark providers with more rides pending if truncated
        if (data.hasMore) {
          ALL_PROVIDERS.forEach(p => {
            if (counts[p.id] > 0) counts[p.id] = `${counts[p.id]}+`;
          });
        }
        setRideCounts(counts);
      } catch {
        // counts stay empty — non-critical
      }
    })();
  }, [user]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const toggleProvider = (id) => {
    setPreferredProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayName, phoneNumber, homeState, preferredProviders }),
      });
      if (!res.ok) throw new Error('Update failed');
      await refreshUserData();
      showToast('Profile saved ✓');
    } catch {
      setError('Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="dash-header">
        <span className="dash-logo">🚕 FAREXO</span>
        <nav className="dash-nav">
          <Link href="/dashboard" className="dash-nav-link">← Dashboard</Link>
          <Link href="/history" className="dash-nav-link">History</Link>
        </nav>
      </header>

      <main className="profile-main">
        <h1 className="profile-title">Your Profile</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSave} className="profile-form">
          {/* ── Basic info ── */}
          <section className="profile-section">
            <h2 className="profile-section-title">Account Info</h2>

            <div className="auth-field">
              <label htmlFor="prof-name">Full Name</label>
              <input
                id="prof-name"
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="prof-email">Email <span className="profile-readonly">(read-only)</span></label>
              <input
                id="prof-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="auth-input--disabled"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="prof-phone">Phone Number</label>
              <input
                id="prof-phone"
                type="tel"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="prof-state">Home State</label>
              <select
                id="prof-state"
                value={homeState}
                onChange={e => setHomeState(e.target.value)}
                className="auth-select"
              >
                <option value="">— Select a state —</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </section>

          {/* ── Preferred providers ── */}
          <section className="profile-section">
            <h2 className="profile-section-title">Preferred Providers</h2>
            <p className="profile-hint">Only selected providers will appear in search results.</p>
            <div className="profile-toggles">
              {ALL_PROVIDERS.map(p => {
                const active = preferredProviders.includes(p.id);
                return (
                  <div key={p.id} className="profile-toggle-row">
                    <div className="profile-toggle-info">
                      <span className="profile-toggle-label">{p.label}</span>
                      <span className="profile-toggle-count">
                        {rideCounts[p.id] !== undefined ? `${rideCounts[p.id]} rides` : '—'}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={active}
                      className={`toggle-switch${active ? ' toggle-switch--on' : ''}`}
                      onClick={() => toggleProvider(p.id)}
                    >
                      <span className="toggle-switch__thumb" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <button type="submit" className="auth-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
