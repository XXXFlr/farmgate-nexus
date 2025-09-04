import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface MapPin {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description?: string;
}

interface GoogleMapComponentProps {
  pins: MapPin[];
  onMapClick?: (position: { lat: number; lng: number }) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194
};

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ 
  pins, 
  onMapClick, 
  center = defaultCenter, 
  zoom = 10 
}) => {
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    // Optional: You can store the map instance here if needed
  }, []);

  const onUnmount = useCallback((map: google.maps.Map) => {
    // Cleanup if needed
  }, []);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng && onMapClick) {
      const position = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      onMapClick(position);
    }
  }, [onMapClick]);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={pin.position}
            onClick={() => setSelectedPin(pin)}
          />
        ))}

        {selectedPin && (
          <InfoWindow
            position={selectedPin.position}
            onCloseClick={() => setSelectedPin(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold text-sm">{selectedPin.title}</h3>
              {selectedPin.description && (
                <p className="text-xs text-gray-600 mt-1">{selectedPin.description}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;