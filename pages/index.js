import React, { useCallback, useState } from 'react';
import SearchForm from '../components/SearchForm';
import ResultsFeed from '../components/ResultsFeed';
import dynamic from 'next/dynamic';
const FirebaseAuth = dynamic(() => import('../components/FirebaseAuth'), { ssr: false });

/**
 * Home page – orchestrates the Search → Results flow.
 * Page 1: SearchForm (capture intent + location).
 * Page 2: ResultsFeed (live comparison from API).
 */
export default function HomePage() {
  const [view, setView] = useState('search'); // 'search' | 'results'
  const [routeData, setRouteData] = useState(null);

  const handleSearch = useCallback((data) => {
    setRouteData(data);
    setView('results');
  }, []);

  const handleBack = useCallback(() => {
    setView('search');
  }, []);

  if (view === 'results' && routeData) {
    return (
      <ResultsFeed
        pickup={routeData.pickup}
        dropoff={routeData.dropoff}
        onBack={handleBack}
      />
    );
  }

  return (
    <div>
      <div style={{ maxWidth: 900, margin: '16px auto' }}>
        <FirebaseAuth />
        <SearchForm onSearch={handleSearch} />
      </div>
    </div>
  );
}

