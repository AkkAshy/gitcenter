import React, { useEffect, useState, useCallback } from 'react';
import { useMap, Polygon, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';

export interface City {
  id: string;
  name: string;
  points: [number, number][];
  color: string;
}

interface CityDrawerProps {
  isEnabled: boolean;
  cities: City[];
  setCities: React.Dispatch<React.SetStateAction<City[]>>;
  activeCityId: string | null;
  setActiveCityId: React.Dispatch<React.SetStateAction<string | null>>;
}

// Генерация случайного цвета
function generateColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#06b6d4'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Генерация уникального ID
function generateId(): string {
  return `city_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Компонент для обработки кликов по карте
function MapClickHandler({
  isEnabled,
  cities,
  setCities,
  activeCityId
}: Omit<CityDrawerProps, 'setActiveCityId'>) {
  const map = useMap();

  useEffect(() => {
    if (!isEnabled || !activeCityId) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const newPoint: [number, number] = [
        parseFloat(lat.toFixed(4)),
        parseFloat(lng.toFixed(4))
      ];

      setCities(prev => prev.map(city => {
        if (city.id === activeCityId) {
          return {
            ...city,
            points: [...city.points, newPoint]
          };
        }
        return city;
      }));
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, isEnabled, activeCityId, setCities]);

  return null;
}

// Компонент для отображения городов
function CityPolygons({
  cities,
  activeCityId,
  isEnabled,
  setCities
}: {
  cities: City[],
  activeCityId: string | null,
  isEnabled: boolean,
  setCities: React.Dispatch<React.SetStateAction<City[]>>
}) {
  const handlePointDrag = useCallback((cityId: string, pointIndex: number, newPos: L.LatLng) => {
    setCities(prev => prev.map(city => {
      if (city.id === cityId) {
        const newPoints = [...city.points];
        newPoints[pointIndex] = [
          parseFloat(newPos.lat.toFixed(4)),
          parseFloat(newPos.lng.toFixed(4))
        ];
        return { ...city, points: newPoints };
      }
      return city;
    }));
  }, [setCities]);

  const handlePointDelete = useCallback((cityId: string, pointIndex: number) => {
    setCities(prev => prev.map(city => {
      if (city.id === cityId) {
        const newPoints = city.points.filter((_, idx) => idx !== pointIndex);
        return { ...city, points: newPoints };
      }
      return city;
    }));
  }, [setCities]);

  return (
    <>
      {cities.map(city => (
        <React.Fragment key={city.id}>
          {/* Полигон города */}
          {city.points.length >= 3 && (
            <Polygon
              positions={city.points}
              pathOptions={{
                color: city.color,
                fillColor: city.color,
                fillOpacity: city.id === activeCityId ? 0.4 : 0.2,
                weight: city.id === activeCityId ? 3 : 2,
                dashArray: city.id === activeCityId ? undefined : '5, 5',
              }}
            />
          )}

          {/* Линия для незамкнутого полигона */}
          {city.points.length >= 2 && city.points.length < 3 && (
            <Polyline
              positions={city.points}
              pathOptions={{
                color: city.color,
                weight: 2,
              }}
            />
          )}

          {/* Точки - показываем только в режиме редактирования */}
          {isEnabled && city.points.map((point, idx) => (
            <Marker
              key={`${city.id}-point-${idx}`}
              position={point}
              draggable={city.id === activeCityId}
              eventHandlers={{
                dragend: (e) => {
                  handlePointDrag(city.id, idx, e.target.getLatLng());
                },
                contextmenu: (e) => {
                  e.originalEvent.preventDefault();
                  if (city.id === activeCityId) {
                    handlePointDelete(city.id, idx);
                  }
                }
              }}
              icon={L.divIcon({
                className: 'city-point',
                html: `<div style="
                  background: ${city.id === activeCityId ? city.color : '#666'};
                  color: white;
                  width: ${city.id === activeCityId ? '24px' : '18px'};
                  height: ${city.id === activeCityId ? '24px' : '18px'};
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: ${city.id === activeCityId ? '11px' : '9px'};
                  font-weight: bold;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  cursor: ${city.id === activeCityId ? 'move' : 'pointer'};
                ">${idx + 1}</div>`,
                iconSize: city.id === activeCityId ? [24, 24] : [18, 18],
                iconAnchor: city.id === activeCityId ? [12, 12] : [9, 9],
              })}
            />
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

// Основной компонент CityDrawer
export function CityDrawer(props: CityDrawerProps) {
  const { isEnabled, cities, setCities, activeCityId, setActiveCityId } = props;

  return (
    <>
      <MapClickHandler
        isEnabled={isEnabled}
        cities={cities}
        setCities={setCities}
        activeCityId={activeCityId}
      />
      <CityPolygons
        cities={cities}
        activeCityId={activeCityId}
        isEnabled={isEnabled}
        setCities={setCities}
      />
    </>
  );
}

// Панель управления городами
interface CityControlPanelProps {
  isEnabled: boolean;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  cities: City[];
  setCities: React.Dispatch<React.SetStateAction<City[]>>;
  activeCityId: string | null;
  setActiveCityId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function CityControlPanel({
  isEnabled,
  setIsEnabled,
  cities,
  setCities,
  activeCityId,
  setActiveCityId
}: CityControlPanelProps) {
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // Создать новый город
  const createCity = () => {
    const newCity: City = {
      id: generateId(),
      name: `Город ${cities.length + 1}`,
      points: [],
      color: generateColor()
    };
    setCities(prev => [...prev, newCity]);
    setActiveCityId(newCity.id);
    setIsEnabled(true);
  };

  // Удалить город
  const deleteCity = (cityId: string) => {
    setCities(prev => prev.filter(c => c.id !== cityId));
    if (activeCityId === cityId) {
      setActiveCityId(null);
    }
  };

  // Начать редактирование имени
  const startEditName = (city: City) => {
    setEditingName(city.id);
    setTempName(city.name);
  };

  // Сохранить имя
  const saveName = (cityId: string) => {
    setCities(prev => prev.map(c =>
      c.id === cityId ? { ...c, name: tempName } : c
    ));
    setEditingName(null);
  };

  // Экспорт всех городов
  const exportCities = () => {
    const exportData = cities.map(city => ({
      name: city.name,
      color: city.color,
      points: city.points,
      // Вычисляем центр полигона
      center: city.points.length > 0 ? {
        lat: city.points.reduce((sum, p) => sum + p[0], 0) / city.points.length,
        lng: city.points.reduce((sum, p) => sum + p[1], 0) / city.points.length
      } : null
    }));

    console.log('=== ЭКСПОРТ ГОРОДОВ ===');
    console.log(JSON.stringify(exportData, null, 2));
    console.log('=== КОНЕЦ ЭКСПОРТА ===');

    // Копируем в буфер обмена
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      .then(() => alert('Данные скопированы в буфер обмена!'))
      .catch(() => alert('Откройте консоль (F12) чтобы скопировать данные'));
  };

  // Очистить точки активного города
  const clearActiveCity = () => {
    if (!activeCityId) return;
    setCities(prev => prev.map(c =>
      c.id === activeCityId ? { ...c, points: [] } : c
    ));
  };

  // Удалить последнюю точку
  const undoLastPoint = () => {
    if (!activeCityId) return;
    setCities(prev => prev.map(c =>
      c.id === activeCityId ? { ...c, points: c.points.slice(0, -1) } : c
    ));
  };

  return (
    <div style={{
      position: 'absolute',
      top: 80,
      right: 20,
      zIndex: 1000,
      background: 'white',
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      padding: 16,
      maxWidth: 320,
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          Границы городов
        </h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer' }}
          />
          <span style={{ fontSize: 14 }}>Редактирование</span>
        </label>
      </div>

      {/* Кнопки управления */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          onClick={createCity}
          style={{
            padding: '8px 16px',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          + Новый город
        </button>
        <button
          onClick={exportCities}
          disabled={cities.length === 0}
          style={{
            padding: '8px 16px',
            background: cities.length > 0 ? '#3b82f6' : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: cities.length > 0 ? 'pointer' : 'not-allowed',
            fontSize: 14,
            fontWeight: 500
          }}
        >
          Экспорт JSON
        </button>
      </div>

      {/* Список городов */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cities.map(city => (
          <div
            key={city.id}
            style={{
              padding: 12,
              background: activeCityId === city.id ? '#eff6ff' : '#f9fafb',
              border: `2px solid ${activeCityId === city.id ? city.color : '#e5e7eb'}`,
              borderRadius: 8,
              cursor: 'pointer'
            }}
            onClick={() => {
              setActiveCityId(city.id);
              setIsEnabled(true);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: city.color
                }} />
                {editingName === city.id ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => saveName(city.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName(city.id)}
                    autoFocus
                    style={{
                      border: '1px solid #3b82f6',
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: 14,
                      width: 120
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    style={{ fontWeight: 500, fontSize: 14 }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditName(city);
                    }}
                  >
                    {city.name}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCity(city.id);
                }}
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: 4,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: 12
                }}
              >
                Удалить
              </button>
            </div>
            <div style={{
              marginTop: 8,
              fontSize: 12,
              color: '#6b7280',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span>Точек: {city.points.length}</span>
              {city.points.length >= 3 && (
                <span style={{ color: '#22c55e' }}>✓ Полигон готов</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Подсказки при активном редактировании */}
      {isEnabled && activeCityId && (
        <div style={{
          marginTop: 16,
          padding: 12,
          background: '#fef3c7',
          borderRadius: 8,
          fontSize: 12,
          color: '#92400e'
        }}>
          <strong>Подсказки:</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: 16 }}>
            <li>Кликайте на карту чтобы добавить точки</li>
            <li>Перетаскивайте точки чтобы изменить позицию</li>
            <li>Правый клик на точку - удалить её</li>
            <li>Двойной клик на имя города - переименовать</li>
          </ul>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={undoLastPoint}
              style={{
                padding: '6px 12px',
                background: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              ↩ Отмена
            </button>
            <button
              onClick={clearActiveCity}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Очистить всё
            </button>
          </div>
        </div>
      )}

      {cities.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 20,
          color: '#9ca3af'
        }}>
          Нажмите "Новый город" чтобы начать рисовать границы
        </div>
      )}
    </div>
  );
}

export { generateId, generateColor };
