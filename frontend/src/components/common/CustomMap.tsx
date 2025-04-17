import { useState, useCallback } from 'react';
import {
  Map,
  Marker,
  MapMouseEvent,
} from '@vis.gl/react-google-maps';

type Coordinates = {
  lat: number;
  lng: number;
};

interface MapComponentProps {
  onCoordinatesChange: (coords: Coordinates) => void; 
  defaultCenter: Coordinates;
  mapId?: string;
}


const CustomMap= ({
  onCoordinatesChange,
  defaultCenter,
  mapId,
}: MapComponentProps) => {
  const [markerPosition, setMarkerPosition] = useState<Coordinates | null>(null);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      if (event.detail.latLng) {
        const newPosition: Coordinates = {
          lat: event.detail.latLng.lat,
          lng: event.detail.latLng.lng,
        };

        setMarkerPosition(newPosition);
        onCoordinatesChange(newPosition);
      }
    },
    [onCoordinatesChange] 
  );

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={12}
      mapId={mapId}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      onClick={handleMapClick}
    >
      {markerPosition && (
        <Marker
          position={markerPosition}
        />
      )}
    </Map>
  );
};

export default CustomMap;