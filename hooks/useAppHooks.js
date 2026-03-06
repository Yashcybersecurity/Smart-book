import { useEffect, useRef, useState } from 'react';

/**
 * useGeolocation – asks for GPS permission on mount and returns current coords.
 */
export function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Unable to retrieve your location.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { coords, error, loading };
}

/**
 * useDeviceDetect – detects whether the user is on a mobile device.
 */
export function useDeviceDetect() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    setIsMobile(/Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua));
  }, []);

  return { isMobile };
}

/**
 * useStandaloneMode – detects whether the PWA is running in standalone mode
 * (installed on home screen).
 */
export function useStandaloneMode() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    setIsStandalone(mq.matches || navigator.standalone === true);
    const handler = (e) => setIsStandalone(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isStandalone;
}

/**
 * usePlacesAutocomplete – wrapper around Google Maps Places Autocomplete.
 * Attaches autocomplete to an input ref and calls onSelect(place) when a
 * place is picked. Pass `mapsReady` flag so the effect re-runs once the
 * Google Maps script has finished loading.
 *
 * Note: google.maps.places.Autocomplete is deprecated in favour of
 * PlaceAutocompleteElement, but the old API continues to work and is
 * not scheduled for removal. Migration to the web-component based
 * PlaceAutocompleteElement requires restructuring the controlled-input
 * pattern used in SearchForm and is tracked for a future release.
 */
export function usePlacesAutocomplete(inputRef, onSelect, mapsReady) {
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current || typeof window === 'undefined') return;
    if (!mapsReady) return;
    if (!window.google?.maps?.places) return;
    // Don't attach twice
    if (autocompleteRef.current) return;

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      componentRestrictions: { country: 'in' },
      fields: ['formatted_address', 'geometry', 'name'],
    });

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place?.geometry?.location) {
        onSelect({
          address: place.formatted_address || place.name || '',
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    autocompleteRef.current = ac;

    return () => {
      if (window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(ac);
      }
      autocompleteRef.current = null;
    };
  }, [inputRef, onSelect, mapsReady]);
}

/**
 * geocodeAddress – use Google Geocoder to resolve a text string to coords.
 * Returns a promise that resolves to { address, lat, lng } or null.
 */
export function geocodeAddress(text) {
  return new Promise((resolve) => {
    if (!window.google?.maps?.Geocoder) {
      resolve(null);
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { address: text, componentRestrictions: { country: 'in' } },
      (results, status) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          resolve({
            address: results[0].formatted_address,
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          resolve(null);
        }
      }
    );
  });
}
