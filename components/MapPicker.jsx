import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * MapPicker — Full-screen interactive map overlay.
 *
 * Opens a live Google Map where the user can:
 *   1. Pan/zoom to find their location.
 *   2. Tap/click anywhere to drop a pin.
 *   3. Drag the pin for precision placement.
 *   4. Use the embedded search bar (Places Autocomplete) to jump to a place.
 *   5. Use "My Location" button to snap to their GPS position.
 *   6. Click "Confirm Location" to return the lat, lng, and reverse-geocoded address.
 *
 * The map container and search input use wrapper divs with refs that bypass
 * React's DOM reconciliation, preventing "removeChild" errors caused by
 * Google Maps mutating the DOM underneath React.
 *
 * Props:
 *   label      – "Pickup" | "Drop-off" (shown in header)
 *   initial    – { lat, lng } optional starting center
 *   onConfirm  – callback({ address, lat, lng })
 *   onClose    – callback to dismiss without selecting
 */
export default function MapPicker({ label, initial, onConfirm, onClose }) {
  const mapWrapRef = useRef(null);    // wrapper div – we append the real map div inside
  const searchWrapRef = useRef(null); // wrapper div – we append the real search input inside
  const mapObjRef = useRef(null);     // google.maps.Map instance
  const markerRef = useRef(null);     // google.maps.Marker instance
  const geocoderRef = useRef(null);   // Geocoder instance
  const acRef = useRef(null);         // Autocomplete instance
  const cleanupRef = useRef(null);    // cleanup function

  const [selectedPos, setSelectedPos] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  // Default center: India center, overridden by initial prop or geolocation
  const defaultCenter = initial?.lat
    ? { lat: initial.lat, lng: initial.lng }
    : { lat: 12.9716, lng: 77.5946 }; // Bangalore

  // Reverse-geocode a position to get a readable address
  const reverseGeocode = useCallback((lat, lng) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    });
  }, []);

  // Place or move the marker
  const placeMarker = useCallback(
    (lat, lng) => {
      const pos = { lat, lng };
      setSelectedPos(pos);
      reverseGeocode(lat, lng);

      if (markerRef.current) {
        markerRef.current.setPosition(pos);
      } else if (mapObjRef.current) {
        const marker = new window.google.maps.Marker({
          position: pos,
          map: mapObjRef.current,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: 'Drag to adjust',
        });

        marker.addListener('dragend', () => {
          const p = marker.getPosition();
          const newLat = p.lat();
          const newLng = p.lng();
          setSelectedPos({ lat: newLat, lng: newLng });
          reverseGeocode(newLat, newLng);
          mapObjRef.current.panTo({ lat: newLat, lng: newLng });
        });

        markerRef.current = marker;
      }

      mapObjRef.current?.panTo(pos);
    },
    [reverseGeocode]
  );

  // Initialize the map — uses raw DOM to avoid React reconciliation conflicts
  useEffect(() => {
    if (!window.google?.maps) return;

    // Create the map div outside React's tree
    const mapDiv = document.createElement('div');
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    if (mapWrapRef.current) {
      mapWrapRef.current.appendChild(mapDiv);
    }

    // Create the search input outside React's tree
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'map-picker__search';
    searchInput.placeholder = 'Search for a place\u2026';
    searchInput.autocomplete = 'off';
    if (searchWrapRef.current) {
      searchWrapRef.current.appendChild(searchInput);
    }

    const map = new window.google.maps.Map(mapDiv, {
      center: defaultCenter,
      zoom: 15,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: 'greedy',
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'simplified' }] },
      ],
    });

    mapObjRef.current = map;
    geocoderRef.current = new window.google.maps.Geocoder();

    // Click on map → place pin
    map.addListener('click', (e) => {
      placeMarker(e.latLng.lat(), e.latLng.lng());
    });

    // If initial coords provided, place marker there
    if (initial?.lat) {
      placeMarker(initial.lat, initial.lng);
    }

    setLoading(false);

    // Attach Places Autocomplete to the raw search input
    if (window.google.maps.places) {
      const ac = new window.google.maps.places.Autocomplete(searchInput, {
        types: ['geocode', 'establishment'],
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
      });

      ac.bindTo('bounds', map);

      ac.addListener('place_changed', () => {
        const place = ac.getPlace();
        if (place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          placeMarker(lat, lng);
          map.setZoom(17);
        }
      });

      acRef.current = ac;
    }

    // Store cleanup function
    cleanupRef.current = () => {
      // Remove marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      // Clear all Google event listeners
      if (window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(map);
        if (acRef.current) {
          window.google.maps.event.clearInstanceListeners(acRef.current);
        }
      }
      // Remove the DOM nodes we created (outside React's tree)
      if (mapDiv.parentNode) mapDiv.parentNode.removeChild(mapDiv);
      if (searchInput.parentNode) searchInput.parentNode.removeChild(searchInput);
      // Remove any leftover .pac-container dropdowns from the body
      document.querySelectorAll('.pac-container').forEach((el) => el.remove());
      mapObjRef.current = null;
      acRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  // "My Location" — snap to GPS
  function handleMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        placeMarker(pos.coords.latitude, pos.coords.longitude);
        mapObjRef.current?.setZoom(17);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // Confirm selection
  function handleConfirm() {
    if (!selectedPos) return;
    onConfirm({
      address: address || `${selectedPos.lat.toFixed(6)}, ${selectedPos.lng.toFixed(6)}`,
      lat: selectedPos.lat,
      lng: selectedPos.lng,
    });
  }

  return (
    <div className="map-picker-overlay">
      {/* Header bar */}
      <div className="map-picker__header">
        <button type="button" className="map-picker__close" onClick={onClose}>
          ✕
        </button>
        <span className="map-picker__title">Select {label} Location</span>
        <div style={{ width: 36 }} />
      </div>

      {/* Search bar wrapper — real input appended by useEffect */}
      <div className="map-picker__search-wrap" ref={searchWrapRef} />

      {/* Map container wrapper — real map div appended by useEffect */}
      <div className="map-picker__map" ref={mapWrapRef}>
        {loading && (
          <div className="map-picker__loading">Loading map…</div>
        )}
      </div>

      {/* Crosshair hint in center */}
      <div className="map-picker__crosshair" aria-hidden="true">+</div>

      {/* My Location FAB */}
      <button
        type="button"
        className="map-picker__locate-btn"
        onClick={handleMyLocation}
        disabled={locating}
        aria-label="Use my current location"
      >
        {locating ? '⏳' : '📍'}
      </button>

      {/* Bottom panel */}
      <div className="map-picker__bottom">
        {selectedPos ? (
          <>
            <div className="map-picker__address">{address || 'Getting address…'}</div>
            <div className="map-picker__coords">
              {selectedPos.lat.toFixed(6)}, {selectedPos.lng.toFixed(6)}
            </div>
            <button
              type="button"
              className="map-picker__confirm"
              onClick={handleConfirm}
            >
              Confirm {label} Location
            </button>
          </>
        ) : (
          <div className="map-picker__hint">
            Tap on the map or search to pick a location
          </div>
        )}
      </div>
    </div>
  );
}
