import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import Link from 'next/link';
import { auth } from '../lib/firebaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function afterAuth(firebaseUser, name = '') {
    const token = await firebaseUser.getIdToken();

    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });

    await fetch('/api/user/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: name || firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || '',
        phoneNumber: phone || '',
      }),
    });

    router.push('/onboarding');
  }

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: fullName });
      await afterAuth(result.user, fullName);
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await afterAuth(result.user, result.user.displayName || '');
    } catch (err) {
      setError(getErrorMessage(err.code));
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🚕 FAREXO</div>
        <p className="auth-tagline">Create your account</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleEmailSignup} className="auth-form">
          <div className="auth-field">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Rohit Sharma"
              required
              autoComplete="name"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-phone">Phone Number</label>
            <input
              id="signup-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              autoComplete="tel"
            />
          </div>
          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button onClick={handleGoogleSignup} className="auth-btn-google" disabled={loading}>
          <GoogleIcon />
          Sign up with Google
        </button>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function getErrorMessage(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password is too weak.',
    'auth/popup-closed-by-user': 'Sign-up popup was closed.',
  };
  return map[code] || 'Sign up failed. Please try again.';
}
