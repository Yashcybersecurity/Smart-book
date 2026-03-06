import React from 'react';

/**
 * Offline fallback page served by the Service Worker when the
 * user is offline and there's no cached version of the requested page.
 */
export default function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="offline-page__card">
        <div className="offline-page__icon">📡</div>
        <h1 className="offline-page__title">You&apos;re offline</h1>
        <p className="offline-page__text">
          FAREXO needs an internet connection to fetch live ride prices.
          Please check your connection and try again.
        </p>
        <button
          type="button"
          className="offline-page__retry"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );
}
