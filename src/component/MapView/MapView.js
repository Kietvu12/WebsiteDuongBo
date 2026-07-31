import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Popup,
  Tooltip,
  useMap,
  ZoomControl,
  Marker
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { kml } from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import { FiMaximize2, FiLayers } from 'react-icons/fi';

import ContractorInfo from '../ContractorInfo/ContractorInfo';
import ConstructionVolume from '../ConstructionVolume/ConstructionVolume';
import ProgressChart from '../ProgressChart/ProgressChart';
import {
  VIETNAM_CENTER,
  VIETNAM_ZOOM,
  fitVietnamView,
} from '../../utils/vietnamMapView';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

function isValidLatLng(p) {
  return (
    Array.isArray(p) &&
    p.length === 2 &&
    Number.isFinite(p[0]) &&
    Number.isFinite(p[1]) &&
    p[0] >= -90 &&
    p[0] <= 90 &&
    p[1] >= -180 &&
    p[1] <= 180
  );
}

function sanitizeRoutePoints(points) {
  if (!Array.isArray(points)) return [];
  return points.filter(isValidLatLng);
}

function createRoutePinIcon(fillHex) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44" aria-hidden="true">
    <path d="M18 2C9.7 2 3 8.4 3 16.2c0 10.2 11.2 22.3 14.2 25.4.8.8 2.1.8 2.9 0 3-3.2 14.2-15.2 14.2-25.4C34 8.4 27.3 2 18 2z" fill="${fillHex}" stroke="#ffffff" stroke-width="2.5"/>
    <circle cx="18" cy="16" r="7" fill="#ffffff"/>
  </svg>`;
  return L.divIcon({
    className: 'route-pin-marker',
    html: svg,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40]
  });
}

function buildProgressSegments(points, phanTram) {
  if (!points?.length || points.length < 2) return null;

  const specs = [
    { pct: Number(phanTram?.keHoach) || 0, color: '#06b6d4', label: 'Kế hoạch', key: 'keHoach' },
    { pct: Number(phanTram?.hoanThanh) || 0, color: '#16a34a', label: 'Hoàn thành', key: 'hoanThanh' },
    { pct: Number(phanTram?.dangLam) || 0, color: '#eab308', label: 'Đang làm', key: 'dangLam' },
    { pct: Number(phanTram?.chamTienDo) || 0, color: '#dc2626', label: 'Chậm tiến độ', key: 'chamTienDo' }
  ];

  const active = specs.filter((s) => s.pct > 0);
  const sum = active.reduce((a, s) => a + s.pct, 0);
  if (sum <= 0) return null;

  const n = points.length;
  const maxIndex = n - 1;
  const out = [];
  let startIdx = 0;
  let acc = 0;

  active.forEach((spec, i) => {
    const isLast = i === active.length - 1;
    acc += spec.pct / sum;
    let endIdx = isLast ? maxIndex : Math.min(maxIndex, Math.round(acc * maxIndex));
    if (!isLast) endIdx = Math.max(startIdx + 1, endIdx);
    let positions = points.slice(startIdx, endIdx + 1);
    if (positions.length < 2 && maxIndex > 0) {
      positions = points.slice(Math.max(0, startIdx - 1), endIdx + 1);
    }
    if (positions.length >= 2) {
      out.push({ positions, color: spec.color, label: spec.label, key: spec.key });
    }
    startIdx = endIdx;
  });

  return out.length ? out : null;
}

function formatKmLine(selectedProject) {
  if (!selectedProject) return '';
  const a = selectedProject.Km_BatDau;
  const b = selectedProject.Km_KetThuc;
  if (a == null || b == null) return '';
  const seg = (s) => {
    const t = String(s).trim();
    if (!t) return '';
    return /^km/i.test(t) ? t : `Km${t}`;
  };
  return `${seg(a)} — ${seg(b)}`;
}

function contractorLine(selectedProject) {
  if (!selectedProject) return '---';
  const nt = selectedProject.nhaThau;
  if (Array.isArray(nt) && nt.length) {
    return nt.map((x) => x.TenNhaThau).filter(Boolean).join(' - ') || '---';
  }
  return selectedProject.tenNhaThau || '---';
}

function parseCoord(value) {
  if (value == null || value === '') return null;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : null;
}

function resolveKmlUrl(kmlPath) {
  if (!kmlPath) return null;
  if (/^https?:\/\//i.test(kmlPath)) return kmlPath;
  const base = (API_BASE_URL || window.location.origin).replace(/\/$/, '');
  return `${base}${kmlPath.startsWith('/') ? kmlPath : `/${kmlPath}`}`;
}

function toLatLngPoint(coord) {
  if (!Array.isArray(coord) || coord.length < 2) return null;
  const lng = parseFloat(coord[0]);
  const lat = parseFloat(coord[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function sanitizeSegment(segment) {
  if (!Array.isArray(segment)) return [];
  const cleaned = segment.map(toLatLngPoint).filter(Boolean);
  return cleaned.length >= 2 ? cleaned : [];
}

async function parseKmlToRoute(kmlUrl) {
  const res = await fetch(kmlUrl);
  if (!res.ok) return null;
  const kmlText = await res.text();
  const kmlDom = new DOMParser().parseFromString(kmlText, 'text/xml');
  const geoJsonData = kml(kmlDom);
  const points = [];

  (geoJsonData.features || []).forEach((feature) => {
    const geom = feature.geometry;
    if (!geom) return;
    const pushCoords = (coords) => {
      sanitizeSegment(coords).forEach((pt) => points.push(pt));
    };
    if (geom.type === 'LineString') pushCoords(geom.coordinates);
    else if (geom.type === 'MultiLineString') {
      geom.coordinates.forEach(pushCoords);
    } else if (geom.type === 'Polygon' && geom.coordinates?.[0]) {
      pushCoords(geom.coordinates[0]);
    }
  });

  return points.length >= 2 ? points : null;
}

async function fetchOsrmRoute(start, end) {
  const response = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
  );
  const data = await response.json();
  if (data.routes?.length > 0) {
    return data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]);
  }
  if (data.routes?.length > 0) {
    return sanitizeRoutePoints(
      data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]])
    );
  }
  return sanitizeRoutePoints([start, end]);
}

function fitVietnam(map) {
  fitVietnamView(map);
}

function getRouteBounds(routePoints) {
  const valid = sanitizeRoutePoints(routePoints);
  if (valid.length === 0) return null;
  if (valid.length === 1) {
    return L.latLngBounds([valid[0], valid[0]]);
  }
  return L.latLngBounds(valid);
}

const RouteMapController = ({ routePoints, fitSignal, isExpanded, fitRouteMode }) => {
  const map = useMap();

  const fitRoute = useCallback(() => {
    const bounds = getRouteBounds(routePoints);
    if (!bounds?.isValid()) {
      fitVietnam(map);
      return;
    }
    try {
      map.fitBounds(bounds, {
        padding: [24, 24],
        maxZoom: 14,
        animate: true,
        duration: 0.45
      });
    } catch {
      fitVietnam(map);
    }
  }, [map, routePoints]);

  useEffect(() => {
    fitVietnam(map);
  }, [map]);

  useEffect(() => {
    if (fitRouteMode) fitRoute();
    else fitVietnam(map);
  }, [fitRoute, fitSignal, fitRouteMode, map]);

  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (fitRouteMode) fitRoute();
      else fitVietnam(map);
    }, isExpanded ? 320 : 180);
    return () => clearTimeout(t);
  }, [isExpanded, map, fitRoute, fitRouteMode]);

  return null;
};

function progressPairLines(phanTram) {
  if (!phanTram) return { gpmb: null, thiCong: null };
  const keHoach = Number(phanTram.keHoach) || 0;
  const hoanThanh = Number(phanTram.hoanThanh) || 0;
  const dangLam = Number(phanTram.dangLam) || 0;
  return {
    gpmb: Math.min(100, Math.round(keHoach)),
    thiCong: Math.min(100, Math.round(hoanThanh + dangLam))
  };
}

const MapView = ({ selectedProject, progressPhanTram, packageIndex, isExpanded }) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [fitSignal, setFitSignal] = useState(0);
  const [fitRouteMode, setFitRouteMode] = useState(false);
  const [mapType, setMapType] = useState('standard');
  const [showLegend, setShowLegend] = useState(true);

  const mapTypes = {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite:
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  };

  const startPoint = useMemo(() => {
    const lat = parseCoord(selectedProject?.ToaDo_BatDau_Y);
    const lng = parseCoord(selectedProject?.ToaDo_BatDau_X);
    return lat != null && lng != null ? [lat, lng] : null;
  }, [selectedProject]);

  const endPoint = useMemo(() => {
    const lat = parseCoord(selectedProject?.ToaDo_KetThuc_Y);
    const lng = parseCoord(selectedProject?.ToaDo_KetThuc_X);
    return lat != null && lng != null ? [lat, lng] : null;
  }, [selectedProject]);

  useEffect(() => {
    let cancelled = false;

    const loadRoute = async () => {
      if (!selectedProject) {
        setRoute(null);
        setRouteError('');
        return;
      }

      setLoading(true);
      setRouteError('');
      setRoute(null);

      try {
        const kmlUrl = resolveKmlUrl(selectedProject.PathData);
        if (kmlUrl) {
          const kmlRoute = await parseKmlToRoute(kmlUrl);
          if (!cancelled && kmlRoute) {
            setRoute(sanitizeRoutePoints(kmlRoute));
            return;
          }
        }

        if (startPoint && endPoint) {
          const osrmRoute = await fetchOsrmRoute(startPoint, endPoint);
          if (!cancelled && osrmRoute.length >= 2) {
            setRoute(osrmRoute);
            return;
          }
        }

        if (!cancelled) {
          setRouteError('Không tải được tuyến. Kiểm tra file KML hoặc tọa độ gói thầu.');
        }
      } catch (error) {
        console.error('MapView route error:', error);
        if (!cancelled) {
          if (startPoint && endPoint) {
            const fallback = sanitizeRoutePoints([startPoint, endPoint]);
            if (fallback.length >= 2) setRoute(fallback);
            else setRouteError('Lỗi khi tải dữ liệu tuyến.');
          } else {
            setRouteError('Lỗi khi tải dữ liệu tuyến.');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRoute();
    return () => {
      cancelled = true;
    };
  }, [selectedProject, startPoint, endPoint]);

  const safeRoute = useMemo(() => sanitizeRoutePoints(route), [route]);
  const routeSegments = useMemo(
    () => (safeRoute.length >= 2 ? buildProgressSegments(safeRoute, progressPhanTram) : null),
    [safeRoute, progressPhanTram]
  );

  const lineWeight = 10;
  const { gpmb: gpmbPct, thiCong: thiCongPct } = progressPairLines(progressPhanTram);

  const segmentTooltip = (seg) => (
    <Tooltip sticky direction="top" opacity={1} interactive className="route-segment-tooltip" maxWidth={320}>
      <div className="route-tooltip-inner">
        {packageIndex != null && <div className="route-popup-title"># GT - {packageIndex + 1}</div>}
        <div className="route-popup-sub">
          {selectedProject?.TenGoiThau}
          {formatKmLine(selectedProject) && (
            <>
              <br />
              <span className="route-popup-km">{formatKmLine(selectedProject)}</span>
            </>
          )}
        </div>
        {progressPhanTram && gpmbPct != null && thiCongPct != null && (
          <div className="route-tooltip-progress">
            <div><strong>{gpmbPct}%</strong> Kế hoạch / GPMB</div>
            <div><strong>{thiCongPct}%</strong> Thi công</div>
          </div>
        )}
        <div className="route-popup-status">
          <span className="route-popup-dot" style={{ background: seg.color }} />
          {seg.label}
        </div>
        <div className="route-popup-contractor">Nhà thầu: {contractorLine(selectedProject)}</div>
      </div>
    </Tooltip>
  );

  const routeSummaryTooltip = (
    <Tooltip sticky direction="top" opacity={1} interactive className="route-segment-tooltip" maxWidth={320}>
      <div className="route-tooltip-inner">
        {packageIndex != null && <div className="route-popup-title"># GT - {packageIndex + 1}</div>}
        <div className="route-popup-sub">{selectedProject?.TenGoiThau}</div>
        {formatKmLine(selectedProject) && (
          <div className="route-popup-km mb-1">{formatKmLine(selectedProject)}</div>
        )}
        <div className="route-popup-contractor">Nhà thầu: {contractorLine(selectedProject)}</div>
      </div>
    </Tooltip>
  );

  return (
    <div className="mapview-root w-full h-full rounded shadow-md overflow-hidden relative">
      <div className={`mapview-canvas ${isExpanded ? 'mapview-canvas--expanded' : ''}`}>
        <MapContainer
          center={VIETNAM_CENTER}
          zoom={VIETNAM_ZOOM}
          scrollWheelZoom
          zoomControl={false}
          className="w-full h-full min-h-52"
          wheelDebounceTime={80}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            attribution='© OpenStreetMap'
            url={mapTypes[mapType]}
          />

          {routeSegments
            ? routeSegments.map((seg) => (
                <Polyline
                  key={seg.key}
                  positions={seg.positions}
                  pathOptions={{
                    color: seg.color,
                    weight: lineWeight,
                    opacity: 1,
                    lineJoin: 'round',
                    lineCap: 'round'
                  }}
                >
                  {segmentTooltip(seg)}
                </Polyline>
              ))
            : safeRoute.length >= 2 && (
                <Polyline
                  positions={safeRoute}
                  pathOptions={{
                    color: '#2563eb',
                    weight: lineWeight,
                    opacity: 1,
                    lineJoin: 'round',
                    lineCap: 'round'
                  }}
                >
                  {routeSummaryTooltip}
                </Polyline>
              )}

          {isValidLatLng(startPoint) && (
            <MarkerLike position={startPoint} color="#f97316" label="Điểm đầu" project={selectedProject} km={selectedProject?.Km_BatDau} />
          )}
          {isValidLatLng(endPoint) && (
            <MarkerLike position={endPoint} color="#22c55e" label="Điểm cuối" project={selectedProject} km={selectedProject?.Km_KetThuc} />
          )}

          <RouteMapController
            routePoints={safeRoute}
            fitSignal={fitSignal}
            isExpanded={isExpanded}
            fitRouteMode={fitRouteMode}
          />
        </MapContainer>

        <div className="mapview-toolbar">
          <button
            type="button"
            className="mapview-toolbar-btn"
            onClick={() => {
              setFitRouteMode(true);
              setFitSignal((n) => n + 1);
            }}
            title="Zoom vào tuyến"
          >
            <FiMaximize2 size={16} />
            <span>Vào tuyến</span>
          </button>
          <button
            type="button"
            className="mapview-toolbar-btn"
            onClick={() => {
              setFitRouteMode(false);
              setFitSignal((n) => n + 1);
            }}
            title="Zoom vào Việt Nam"
          >
            <span>Việt Nam</span>
          </button>
          <button
            type="button"
            className={`mapview-toolbar-btn ${mapType === 'satellite' ? 'is-active' : ''}`}
            onClick={() => setMapType((t) => (t === 'standard' ? 'satellite' : 'standard'))}
            title="Đổi nền bản đồ"
          >
            <FiLayers size={16} />
            <span>{mapType === 'standard' ? 'Vệ tinh' : 'Đường phố'}</span>
          </button>
          <button
            type="button"
            className={`mapview-toolbar-btn ${showLegend ? 'is-active' : ''}`}
            onClick={() => setShowLegend((v) => !v)}
          >
            <span>Chú thích</span>
          </button>
        </div>

        {showLegend && (
          <div className="mapview-legend">
            <div className="mapview-legend-title">Tiến độ tuyến</div>
            <div className="mapview-legend-item"><span style={{ background: '#06b6d4' }} /> Kế hoạch</div>
            <div className="mapview-legend-item"><span style={{ background: '#16a34a' }} /> Hoàn thành</div>
            <div className="mapview-legend-item"><span style={{ background: '#eab308' }} /> Đang làm</div>
            <div className="mapview-legend-item"><span style={{ background: '#dc2626' }} /> Chậm tiến độ</div>
          </div>
        )}

        {selectedProject && (
          <div className="mapview-route-badge">
            <div className="mapview-route-badge-title">
              {packageIndex != null ? `# GT-${packageIndex + 1}` : 'Gói thầu'}
            </div>
            <div className="mapview-route-badge-sub">{selectedProject.TenGoiThau}</div>
            {formatKmLine(selectedProject) && (
              <div className="mapview-route-badge-km">{formatKmLine(selectedProject)}</div>
            )}
          </div>
        )}

        {loading && (
          <div className="mapview-loading">
            <div className="mapview-loading-spinner" />
            <span>Đang tải tuyến...</span>
          </div>
        )}

        {!loading && routeError && (
          <div className="mapview-error">{routeError}</div>
        )}
      </div>

      {isExpanded && selectedProject && (
        <div className="absolute top-5 right-5 flex flex-col gap-4 z-[1001] pointer-events-none">
          <div className="animate-[slideInFromRight_0.4s_ease_forwards] pointer-events-auto w-[550px] h-[30%]">
            <ConstructionVolume data={{ khoiLuongThiCong: selectedProject.khoiLuongThiCong }} />
          </div>
          <div className="animate-[slideInFromRight_0.4s_ease_forwards] pointer-events-auto w-[550px] h-[30%]" style={{ animationDelay: '0.1s' }}>
            <ContractorInfo data={selectedProject} />
          </div>
          <div className="animate-[slideInFromRight_0.4s_ease_forwards] pointer-events-auto w-[550px] h-[30%]" style={{ animationDelay: '0.2s' }}>
            <ProgressChart data={selectedProject.phanTram} />
          </div>
        </div>
      )}
    </div>
  );
};

function MarkerLike({ position, color, label, project, km }) {
  return (
    <Marker position={position} icon={createRoutePinIcon(color)} zIndexOffset={2500}>
      <Popup className="route-segment-popup">
        <div className="route-popup-inner">
          <div className="route-popup-title">{label}</div>
          <div className="route-popup-sub">{project?.TenGoiThau}</div>
          <div className="route-popup-km">Km: {km}</div>
        </div>
      </Popup>
    </Marker>
  );
}

export default MapView;
