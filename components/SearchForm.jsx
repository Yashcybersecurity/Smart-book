import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useGeolocation, usePlacesAutocomplete, geocodeAddress } from '../hooks/useAppHooks';
import MapPicker from './MapPicker';

/**
 * SearchForm – "Page 1" of the PWA.
 * Two autocomplete inputs (Pickup / Drop-off) each with a "Pick on Map" button
 * that opens a full-screen interactive map for precision location selection.
 * On submit, fires onSearch({ pickup, dropoff }) with coords + address.
 */
export default function SearchForm({ onSearch }) {
  const { data: session, status } = useSession();
  const { coords: geoCoords, loading: geoLoading } = useGeolocation();

  const [pickup, setPickup] = useState({ address: '', lat: null, lng: null });
  const [dropoff, setDropoff] = useState({ address: '', lat: null, lng: null });
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [formError, setFormError] = useState('');
  const [mapsReady, setMapsReady] = useState(false);

  // Map picker state: null | 'pickup' | 'dropoff'
  const [mapPickerFor, setMapPickerFor] = useState(null);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  // Detect Google Maps script loaded
  useEffect(() => {
    if (window.google?.maps?.places) {
      setMapsReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        setMapsReady(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Attach Places Autocomplete (re-runs when mapsReady flips to true)
  usePlacesAutocomplete(
    pickupRef,
    useCallback((place) => {
      setPickup(place);
      setPickupText(place.address);
    }, []),
    mapsReady
  );

  usePlacesAutocomplete(
    dropoffRef,
    useCallback((place) => {
      setDropoff(place);
      setDropoffText(place.address);
    }, []),
    mapsReady
  );

  // Pre-fill pickup with GPS coords label
  useEffect(() => {
    if (geoCoords && !pickup.lat) {
      setPickup({ address: 'Current Location', lat: geoCoords.lat, lng: geoCoords.lng });
      setPickupText('📍 Current Location');
    }
  }, [geoCoords, pickup.lat]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    // If user typed text but didn't pick from autocomplete, try geocoding
    let resolvedPickup = pickup;
    let resolvedDropoff = dropoff;

    if ((!pickup.lat || !pickup.lng) && pickupText.trim()) {
      const geo = await geocodeAddress(pickupText.trim());
      if (geo) {
        resolvedPickup = geo;
        setPickup(geo);
        setPickupText(geo.address);
      }
    }

    if ((!dropoff.lat || !dropoff.lng) && dropoffText.trim()) {
      const geo = await geocodeAddress(dropoffText.trim());
      if (geo) {
        resolvedDropoff = geo;
        setDropoff(geo);
        setDropoffText(geo.address);
      }
    }

    if (!resolvedPickup.lat || !resolvedPickup.lng) {
      setFormError('Please select a valid pickup location.');
      return;
    }
    if (!resolvedDropoff.lat || !resolvedDropoff.lng) {
      setFormError('Please select a valid drop-off location.');
      return;
    }

    onSearch({ pickup: resolvedPickup, dropoff: resolvedDropoff });
  }

  // Map picker confirm handlers
  function handleMapConfirm(place) {
    if (mapPickerFor === 'pickup') {
      setPickup(place);
      setPickupText(place.address);
    } else if (mapPickerFor === 'dropoff') {
      setDropoff(place);
      setDropoffText(place.address);
    }
    setMapPickerFor(null);
  }

  // Initial coords to center the map on when opening picker
  function getMapInitial(which) {
    if (which === 'pickup' && pickup.lat) return pickup;
    if (which === 'dropoff' && dropoff.lat) return dropoff;
    if (geoCoords) return geoCoords;
    return null;
  }

  return (
    <div className="search-form-wrapper">
      {/* Map Picker Overlay */}
      {mapPickerFor && (
        <MapPicker
          label={mapPickerFor === 'pickup' ? 'Pickup' : 'Drop-off'}
          initial={getMapInitial(mapPickerFor)}
          onConfirm={handleMapConfirm}
          onClose={() => setMapPickerFor(null)}
        />
      )}

      <div className="search-form-card">
        {/* Auth Header */}
        <div className="search-form__auth-header">
          <svg
            className="search-form__profile-icon-left"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {status === 'authenticated' && session?.user ? (
            <div className="search-form__user-info">
              <img
                src={session.user.image}
                alt={session.user.name}
                className="search-form__user-avatar"
              />
              <span className="search-form__user-name">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="search-form__logout-btn"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <a href="/login" className="search-form__signin-btn">Sign in</a>
          )}
        </div>

        <div className="search-form__brand">
          <h1 className="search-form__title">🚕 FAREXO</h1>
          <p className="search-form__subtitle">
            Compare rides across Uber, Ola, Rapido &amp; more — instantly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-form__field">
            <label htmlFor="pickup-input" className="search-form__label">
              Pickup
            </label>
            <div className="search-form__input-row">
              <span className="search-form__input-icon">📍</span>
              <input
                id="pickup-input"
                ref={pickupRef}
                type="text"
                className="search-form__input"
                placeholder={geoLoading ? 'Detecting location…' : 'Enter pickup location'}
                value={pickupText}
                onChange={(e) => setPickupText(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className="search-form__map-btn"
                onClick={() => setMapPickerFor('pickup')}
                title="Pick on map"
                aria-label="Pick pickup location on map"
              >
                🗺️
              </button>
            </div>
          </div>

          <div className="search-form__connector">
            <div className="search-form__connector-line" />
            <div className="search-form__connector-dot">↓</div>
            <div className="search-form__connector-line" />
          </div>

          <div className="search-form__field">
            <label htmlFor="dropoff-input" className="search-form__label">
              Drop-off
            </label>
            <div className="search-form__input-row">
              <span className="search-form__input-icon">📍</span>
              <input
                id="dropoff-input"
                ref={dropoffRef}
                type="text"
                className="search-form__input"
                placeholder="Enter drop-off location"
                value={dropoffText}
                onChange={(e) => setDropoffText(e.target.value)}
                autoComplete="off"
              />
              <button
                type="button"
                className="search-form__map-btn"
                onClick={() => setMapPickerFor('dropoff')}
                title="Pick on map"
                aria-label="Pick drop-off location on map"
              >
                🗺️
              </button>
            </div>
          </div>

          {formError && (
            <div className="search-form__error" role="alert">
              {formError}
            </div>
          )}

          {!mapsReady && (
            <div className="search-form__notice">
              💡 Google Maps is loading. You can also type coordinates manually.
            </div>
          )}

          <button type="submit" className="search-form__submit">
            Search Rides
          </button>
        </form>

        <p className="search-form__footer">
          FAREXO compares fares. Booking happens in the provider's own app.
        </p>
      </div>
    </div>
  );
}
