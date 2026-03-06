import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUserData(null);
      return;
    }
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch('/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data.user || null);
      }
    } catch {
      // Non-critical — userData stays null
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      await fetchUserData(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchUserData]);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch (_) {}
    await fbSignOut(auth);
    setUser(null);
    setUserData(null);
  }, []);

  const refreshUserData = useCallback(async () => {
    if (user) await fetchUserData(user);
  }, [user, fetchUserData]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
