import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapMarker } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// Границы Каракалпакстана (точный полигон нарисованный пользователем)
const KARAKALPAKSTAN_POLYGON: [number, number][] = [
  // Северо-западный угол
  [45.01, 56.02],
  // Западная граница - идет на юг
  [41.34, 56.02],
  [41.25, 57.03],
  [41.29, 57.08],
  [41.33, 57.08],
  [41.34, 57.14],
  [41.35, 57.18],
  [41.37, 57.15],
  [41.37, 57.1],
  [41.43, 57.05],
  [41.48, 57.04],
  [41.54, 57.05],
  [41.59, 57.03],
  [41.66, 56.98],
  [41.72, 56.98],
  [41.81, 56.96],
  [41.87, 56.96],
  [41.91, 56.99],
  [41.92, 57.03],
  [41.93, 57.07],
  [41.92, 57.11],
  [41.96, 57.16],
  [42.01, 57.19],
  [42.05, 57.22],
  [42.11, 57.27],
  [42.13, 57.29],
  [42.14, 57.3],
  [42.15, 57.33],
  [42.15, 57.36],
  [42.15, 57.39],
  [42.16, 57.42],
  [42.16, 57.45],
  [42.15, 57.48],
  [42.15, 57.51],
  [42.16, 57.55],
  [42.15, 57.58],
  [42.15, 57.62],
  [42.14, 57.66],
  [42.15, 57.69],
  [42.16, 57.72],
  [42.17, 57.75],
  [42.17, 57.78],
  [42.17, 57.81],
  [42.17, 57.84],
  [42.18, 57.84],
  [42.19, 57.85],
  [42.18, 57.86],
  [42.19, 57.86],
  [42.2, 57.85],
  [42.21, 57.84],
  [42.22, 57.83],
  [42.22, 57.84],
  [42.23, 57.84],
  [42.24, 57.84],
  [42.23, 57.85],
  [42.23, 57.86],
  [42.22, 57.87],
  [42.22, 57.88],
  [42.21, 57.9],
  [42.22, 57.9],
  [42.23, 57.9],
  [42.23, 57.92],
  [42.23, 57.95],
  [42.27, 57.94],
  [42.29, 57.93],
  [42.3, 57.93],
  [42.32, 57.94],
  [42.34, 57.95],
  [42.36, 57.96],
  [42.37, 57.95],
  [42.38, 57.95],
  [42.39, 57.95],
  [42.4, 57.94],
  [42.41, 57.93],
  [42.42, 57.92],
  [42.43, 57.91],
  [42.44, 57.92],
  [42.44, 57.93],
  [42.45, 57.94],
  [42.43, 57.96],
  [42.43, 57.97],
  [42.46, 57.98],
  [42.47, 57.98],
  [42.48, 57.98],
  [42.49, 57.98],
  [42.49, 57.99],
  [42.49, 58],
  [42.5, 58],
  [42.51, 58],
  [42.52, 58],
  [42.51, 58.01],
  [42.5, 58.01],
  [42.5, 58.02],
  [42.51, 58.04],
  [42.52, 58.04],
  [42.53, 58.05],
  [42.54, 58.05],
  [42.54, 58.07],
  [42.53, 58.07],
  [42.52, 58.06],
  [42.51, 58.07],
  [42.51, 58.09],
  [42.5, 58.11],
  [42.5, 58.12],
  [42.5, 58.13],
  [42.49, 58.14],
  [42.45, 58.13],
  [42.46, 58.17],
  [42.47, 58.2],
  [42.47, 58.22],
  [42.47, 58.26],
  [42.46, 58.3],
  [42.45, 58.33],
  [42.43, 58.35],
  [42.41, 58.37],
  [42.39, 58.39],
  [42.37, 58.4],
  [42.34, 58.4],
  [42.32, 58.4],
  [42.29, 58.4],
  [42.29, 58.43],
  [42.3, 58.45],
  [42.29, 58.47],
  [42.29, 58.5],
  [42.28, 58.51],
  [42.3, 58.51],
  [42.32, 58.51],
  [42.33, 58.5],
  [42.34, 58.48],
  [42.35, 58.46],
  [42.37, 58.44],
  [42.37, 58.42],
  [42.38, 58.41],
  [42.4, 58.41],
  [42.48, 58.34],
  [42.51, 58.32],
  [42.54, 58.32],
  [42.56, 58.3],
  [42.56, 58.26],
  [42.57, 58.23],
  [42.59, 58.2],
  [42.61, 58.16],
  [42.63, 58.15],
  [42.64, 58.15],
  [42.64, 58.16],
  [42.64, 58.18],
  [42.65, 58.2],
  [42.66, 58.22],
  [42.67, 58.24],
  [42.68, 58.25],
  [42.69, 58.27],
  [42.69, 58.29],
  [42.68, 58.34],
  [42.68, 58.38],
  [42.66, 58.41],
  [42.66, 58.43],
  [42.65, 58.44],
  [42.65, 58.46],
  [42.65, 58.48],
  [42.65, 58.5],
  [42.65, 58.54],
  [42.65, 58.56],
  [42.65, 58.59],
  [42.67, 58.61],
  [42.68, 58.6],
  [42.7, 58.6],
  [42.72, 58.6],
  [42.72, 58.61],
  [42.72, 58.63],
  [42.72, 58.65],
  [42.74, 58.64],
  [42.75, 58.62],
  [42.76, 58.62],
  [42.77, 58.62],
  [42.78, 58.62],
  [42.79, 58.62],
  [42.8, 58.63],
  // Аральское море
  [42.53, 59.01],
  [42.53, 59.17],
  [42.43, 59.27],
  [42.42, 59.26],
  [42.4, 59.27],
  [42.39, 59.28],
  [42.38, 59.29],
  [42.37, 59.3],
  [42.36, 59.31],
  [42.36, 59.33],
  [42.35, 59.36],
  [42.33, 59.4],
  [42.32, 59.42],
  [42.31, 59.42],
  [42.3, 59.43],
  [42.29, 59.44],
  [42.29, 59.46],
  [42.29, 59.48],
  [42.29, 59.54],
  [42.29, 59.56],
  [42.29, 59.59],
  [42.3, 59.6],
  [42.3, 59.61],
  [42.29, 59.65],
  [42.3, 59.69],
  [42.3, 59.73],
  [42.29, 59.76],
  [42.28, 59.8],
  [42.28, 59.84],
  [42.29, 59.85],
  [42.3, 59.88],
  [42.3, 59.89],
  [42.29, 59.9],
  [42.28, 59.9],
  [42.28, 59.93],
  [42.27, 59.93],
  [42.26, 59.94],
  [42.25, 59.94],
  [42.24, 59.95],
  [42.23, 59.97],
  [42.23, 59.99],
  [42.22, 59.99],
  [42.22, 60],
  [42.21, 60.01],
  [42.2, 60.02],
  [42.19, 60.02],
  [42.18, 60.02],
  [42.17, 60.02],
  [42.17, 60.01],
  [42.18, 59.97],
  [42.16, 59.97],
  [42.15, 59.96],
  [42.14, 59.95],
  [42.12, 60],
  [42.12, 60.02],
  [42.11, 60.03],
  [42.1, 60.05],
  [42.08, 60.05],
  [42.08, 60.04],
  [42.07, 60.04],
  [42.06, 60.04],
  [42.05, 60.04],
  [42.04, 60.03],
  [42.03, 60.04],
  [42.02, 60.04],
  [42.01, 60.03],
  [42, 60.02],
  [41.99, 60.01],
  [42.01, 59.98],
  [42.01, 59.96],
  [42.01, 59.94],
  [42.01, 59.92],
  [41.99, 59.92],
  [41.98, 59.94],
  [41.96, 59.94],
  [41.94, 59.97],
  [41.95, 59.99],
  [41.95, 60.01],
  [41.95, 60.03],
  [41.93, 60.02],
  [41.92, 60.03],
  [41.91, 60.05],
  [41.9, 60.08],
  [41.9, 60.09],
  [41.9, 60.1],
  [41.84, 60.18],
  [41.83, 60.23],
  [41.79, 60.3],
  [41.77, 60.32],
  [41.76, 60.32],
  [41.75, 60.29],
  [41.76, 60.26],
  [41.77, 60.22],
  [41.79, 60.19],
  [41.8, 60.16],
  [41.8, 60.14],
  [41.8, 60.12],
  [41.81, 60.1],
  [41.8, 60.08],
  [41.77, 60.07],
  [41.76, 60.05],
  [41.71, 60.08],
  [41.67, 60.13],
  [41.62, 60.17],
  [41.58, 60.11],
  [41.45, 60.06],
  [41.35, 60.19],
  [41.25, 60.46],
  [41.25, 60.71],
  [41.25, 60.89],
  [41.24, 61.04],
  [41.16, 61.25],
  [41.32, 61.42],
  [41.33, 61.72],
  // Юго-восточная граница
  [41.02, 62.14],
  [41.05, 62.4],
  [41.86, 61.67],
  [41.98, 61.96],
  [42.2, 61.89],
  [42.5, 61.89],
  [43.22, 62.48],
  [43.25, 62.34],
  [44.17, 61.14],
  [44.32, 61.08],
  // Северо-восточная точка
  [45.57, 58.57],
  // Замыкаем на северо-запад
  [45.01, 56.02],
];

// Внешний прямоугольник (весь мир)
const WORLD_BOUNDS: [number, number][] = [
  [90, -180], [90, 180], [-90, 180], [-90, -180], [90, -180]
];

// Границы Каракалпакстана для ограничения карты
const KARAKALPAKSTAN_BOUNDS: L.LatLngBoundsExpression = [
  [40.5, 55.5],
  [46.0, 63.0]
];

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  onSiteSelect: (siteId: number) => void;
  selectedSiteId?: number | null;
}

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

function FlyToMarker({ position }: { position: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 12, { duration: 1 });
    }
  }, [position, map]);

  return null;
}

function MapBounds() {
  const map = useMap();

  useEffect(() => {
    map.setMaxBounds(KARAKALPAKSTAN_BOUNDS);
    map.setMinZoom(7);
    map.setMaxZoom(18);
  }, [map]);

  return null;
}

// Компонент маски — закрашивает всё кроме Каракалпакстана
function RegionMask() {
  return (
    <Polygon
      positions={[WORLD_BOUNDS, KARAKALPAKSTAN_POLYGON]}
      pathOptions={{
        color: '#ffffff',
        fillColor: '#ffffff',
        fillOpacity: 0.85,
        weight: 0,
      }}
    />
  );
}

// Граница Каракалпакстана
function RegionBorder() {
  return (
    <Polygon
      positions={KARAKALPAKSTAN_POLYGON}
      pathOptions={{
        color: '#3B82F6',
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: 3,
        dashArray: '5, 5',
      }}
    />
  );
}

// Режим рисования полигона (для отладки)
const DRAW_MODE = false; // Поставь true чтобы рисовать границы

function PolygonDrawer({ points, setPoints }: { points: [number, number][], setPoints: React.Dispatch<React.SetStateAction<[number, number][]>> }) {
  const map = useMap();

  useEffect(() => {
    if (!DRAW_MODE) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newPoint: [number, number] = [parseFloat(lat.toFixed(2)), parseFloat(lng.toFixed(2))];
      setPoints(prev => {
        const updated = [...prev, newPoint];
        // Выводим в консоль в формате для копирования
        console.log('=== POLYGON POINTS ===');
        console.log(updated.map(p => `  [${p[0]}, ${p[1]}],`).join('\n'));
        console.log('=== COPY ABOVE ===');
        return updated;
      });
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, setPoints]);

  return null;
}

export default function Map({ onSiteSelect, selectedSiteId }: MapProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const { lang } = useLanguage();

  useEffect(() => {
    api.getMapMarkers().then(setMarkers);
  }, []);

  useEffect(() => {
    if (selectedSiteId) {
      const marker = markers.find(m => m.id === selectedSiteId);
      if (marker) {
        setFlyToPosition([parseFloat(marker.latitude), parseFloat(marker.longitude)]);
      }
    }
  }, [selectedSiteId, markers]);

  const getName = (marker: MapMarker) => {
    switch (lang) {
      case 'uz': return marker.name_uz;
      case 'en': return marker.name_en;
      default: return marker.name_ru;
    }
  };

  // Center on Karakalpakstan
  const center: [number, number] = [42.46, 59.60];

  return (
    <MapContainer
      center={center}
      zoom={7}
      style={{ height: '100%', width: '100%' }}
      maxBounds={KARAKALPAKSTAN_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={7}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds />
      <RegionMask />
      <RegionBorder />
      <FlyToMarker position={flyToPosition} />
      {DRAW_MODE && (
        <>
          <PolygonDrawer points={drawPoints} setPoints={setDrawPoints} />
          {/* Показываем нарисованный полигон */}
          {drawPoints.length > 2 && (
            <Polygon
              positions={drawPoints}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.3,
                weight: 2,
              }}
            />
          )}
          {/* Показываем точки */}
          {drawPoints.map((point, idx) => (
            <Marker
              key={`draw-${idx}`}
              position={point}
              icon={L.divIcon({
                className: 'draw-point',
                html: `<div style="
                  background: #ef4444;
                  color: white;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  font-weight: bold;
                  border: 2px solid white;
                ">${idx + 1}</div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            />
          ))}
        </>
      )}
      {/* Маркеры туристических мест с бэкенда */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[parseFloat(marker.latitude), parseFloat(marker.longitude)]}
          icon={createColoredIcon(marker.category__color || '#3B82F6')}
          eventHandlers={{
            click: () => onSiteSelect(marker.id),
          }}
        >
          <Popup>
            <div style={{ minWidth: 150 }}>
              <strong>{getName(marker)}</strong>
              <br />
              <button
                onClick={() => onSiteSelect(marker.id)}
                style={{
                  marginTop: 8,
                  padding: '4px 12px',
                  background: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {lang === 'uz' ? "Ko'proq" : lang === 'en' ? 'More' : 'Подробнее'}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
