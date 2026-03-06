import React, { useEffect, useState, useRef } from 'react';
import firebaseApp from '../lib/firebaseClient';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';

export default function FirebaseAuth() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const confirmationResultRef = useRef(null);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (!firebaseApp || typeof window === 'undefined') return;
    const auth = getAuth(firebaseApp);
    // track auth state
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    setAuthReady(true);
    return () => unsub();
  }, []);

  async function handleGoogleSignIn() {
    setError('');
    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  function prepareRecaptcha() {
    if (!recaptchaRef.current && typeof window !== 'undefined') {
      const auth = getAuth(firebaseApp);
      recaptchaRef.current = new RecaptchaVerifier('recaptcha-container',
        { size: 'invisible' }, auth);
    }
  }

  async function handleSendCode(e) {
    e.preventDefault();
    setError('');
    if (!phone) return setError('Enter phone number with country code, e.g. +15551234567');
    try {
      prepareRecaptcha();
      const auth = getAuth(firebaseApp);
      const appVerifier = recaptchaRef.current;
      const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
      confirmationResultRef.current = confirmationResult;
      setVerificationSent(true);
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    try {
      if (!confirmationResultRef.current) return setError('No verification in progress');
      const result = await confirmationResultRef.current.confirm(code);
      setUser(result.user);
      setVerificationSent(false);
      setCode('');
      setPhone('');
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  async function handleSignOut() {
    setError('');
    try {
      const auth = getAuth(firebaseApp);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  if (typeof window === 'undefined') return null;

  return (
    <div style={{ marginBottom: 16 }}>
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user.photoURL && <img src={user.photoURL} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />}
          <strong>{user.displayName || user.phoneNumber || user.email}</strong>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleGoogleSignIn} style={{ padding: '8px 12px' }}>Sign in with Google</button>

          <form onSubmit={verificationSent ? handleVerifyCode : handleSendCode} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <input
              placeholder="+15551234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={verificationSent}
              style={{ padding: '8px', minWidth: 160 }}
            />
            {verificationSent ? (
              <>
                <input
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ padding: '8px', width: 120 }}
                />
                <button type="submit">Verify</button>
              </>
            ) : (
              <button type="submit">Send code</button>
            )}
          </form>

          <div id="recaptcha-container" />
        </div>
      )}

      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
    </div>
  );
}
