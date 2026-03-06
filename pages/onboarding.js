import React, { useState } from 'react';
import { useRouter } from 'next/router';
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

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const [homeState, setHomeState] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!homeState) {
      setError('Please select your home state.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ homeState }),
      });
      if (!res.ok) throw new Error('Update failed');
      await refreshUserData();
      router.push('/dashboard');
    } catch {
      setError('Could not save your home state. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-logo">🏠 One last step</div>
        <p className="auth-tagline">
          FAREXO supports intra-state travel only. Select your home state to continue.
        </p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="state-select">Your Home State</label>
            <select
              id="state-select"
              value={homeState}
              onChange={e => setHomeState(e.target.value)}
              required
              className="auth-select"
            >
              <option value="">— Select a state —</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <p className="auth-hint">
            You can change this later in your profile settings.
          </p>
          <button type="submit" className="auth-btn-primary" disabled={loading || !homeState}>
            {loading ? 'Saving…' : 'Continue to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
