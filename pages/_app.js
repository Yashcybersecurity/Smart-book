import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';

export default function App({ Component, pageProps }) {
  // Register Service Worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed — non-critical
      });
    }
  }, []);

  return (
    <AuthProvider>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#111827" />
        <meta name="description" content="Compare rides across Uber, Ola, Rapido, Namma Yatri and more. Find the cheapest and fastest ride instantly." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <title>FAREXO – Ride Comparison</title>
      </Head>
      {/* Google Maps Places API — loaded async per best-practices */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''}&libraries=places,marker&loading=async`}
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

