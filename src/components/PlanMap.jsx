import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function SetView({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords]);
  return null;
}

function PlanMap({ planId }) {
  const inputRef = useRef(null);
  const [coords, setCoords] = useState([52.2297, 21.0122]); // domyślnie Warszawa

  useEffect(() => {
    if (!window.Geoapify || !inputRef.current) return;

    const autocomplete = new window.Geoapify.GeocoderAutocomplete(
      inputRef.current,
      import.meta.env.VITE_GEOAPIFY_KEY,
      {
        placeholder: 'Szukaj lokalizacji...',
        lang: 'pl',
        skipIcons: true,
      }
    );

    autocomplete.on('select', (value) => {
      const { lat, lon } = value?.properties || {};
      if (lat && lon) setCoords([lat, lon]);
    });

    return () => autocomplete.destroy();
  }, []);

  const handleSaveLocation = async () => {
    try {
      await updateDoc(doc(db, 'plans', planId), {
        location: {
          lat: coords[0],
          lng: coords[1],
        },
      });
      alert('📍 Lokalizacja zapisana!');
    } catch (err) {
      console.error(err);
      alert('❌ Błąd zapisu lokalizacji');
    }
  };

  return (
    <div className="relative w-full h-[450px] mt-6">
      <div className="absolute top-2 left-2 z-[1000] bg-white p-2 rounded shadow">
        <input
          ref={inputRef}
          placeholder="Wyszukaj miejsce..."
          className="w-[260px] border rounded p-2 text-sm"
        />
        <button
          onClick={handleSaveLocation}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Zapisz lokalizację
        </button>
      </div>

      <MapContainer center={coords} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        <Marker position={coords} icon={markerIcon} />
        <SetView coords={coords} />
      </MapContainer>
    </div>
  );
}

export default PlanMap;