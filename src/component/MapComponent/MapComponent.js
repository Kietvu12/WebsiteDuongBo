import React, { useEffect, useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import "./MapComponent.css";
import { useNavigate } from "react-router-dom";
import vietnamGeoJson from "../../assets/data/vietnam.json";
import { kml } from "@tmcw/togeojson";
import { DOMParser } from "@xmldom/xmldom";
import * as toGeoJSON from "@mapbox/togeojson";
import KmlLayer from "../KmlLayer";
import {
  VIETNAM_CENTER,
  VIETNAM_ZOOM,
  fitVietnamView,
} from "../../utils/vietnamMapView";

const isValidCoord = (coord) =>
  Array.isArray(coord) &&
  coord.length === 2 &&
  Number.isFinite(coord[0]) &&
  Number.isFinite(coord[1]) &&
  coord[0] >= -90 &&
  coord[0] <= 90 &&
  coord[1] >= -180 &&
  coord[1] <= 180;

const safeFitBounds = (map, coords, options = {}) => {
  const valid = (coords || []).filter(isValidCoord);
  if (!map || valid.length === 0) return false;
  try {
    const bounds =
      valid.length === 1
        ? L.latLngBounds([valid[0], valid[0]])
        : L.latLngBounds(valid);
    if (!bounds.isValid()) return false;
    map.fitBounds(bounds, {
      padding: [28, 28],
      maxZoom: 12,
      animate: true,
      ...options,
    });
    return true;
  } catch {
    return false;
  }
};

const PROJECT_LINE_WEIGHT = 10;

function createRoutePinIcon(fillHex) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44" aria-hidden="true">
    <path d="M18 2C9.7 2 3 8.4 3 16.2c0 10.2 11.2 22.3 14.2 25.4.8.8 2.1.8 2.9 0 3-3.2 14.2-15.2 14.2-25.4C34 8.4 27.3 2 18 2z" fill="${fillHex}" stroke="#ffffff" stroke-width="2.5"/>
    <circle cx="18" cy="16" r="7" fill="#ffffff"/>
  </svg>`;
  return L.divIcon({
    className: "route-pin-marker",
    html: svg,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -40],
  });
}

function extractGoiThauIdFromPath(path) {
  const match = String(path || "").match(/GOITHAU\/(\d+)\//i);
  return match ? Number(match[1]) : null;
}

function normalizeGoiThauFromApi(raw) {
  if (!raw) return null;
  return {
    GoiThau_ID: raw.GoiThau_ID ?? raw.goiThauId,
    TenGoiThau: raw.TenGoiThau ?? raw.tenGoiThau,
    Km_BatDau: raw.Km_BatDau ?? raw.kmBatDau,
    Km_KetThuc: raw.Km_KetThuc ?? raw.kmKetThuc,
    ToaDo_BatDau_X: raw.ToaDo_BatDau_X ?? raw.toaDoBatDau?.x,
    ToaDo_BatDau_Y: raw.ToaDo_BatDau_Y ?? raw.toaDoBatDau?.y,
    ToaDo_KetThuc_X: raw.ToaDo_KetThuc_X ?? raw.toaDoKetThuc?.x,
    ToaDo_KetThuc_Y: raw.ToaDo_KetThuc_Y ?? raw.toaDoKetThuc?.y,
    PathData: raw.PathData ?? raw.pathData,
    TrangThai: raw.TrangThai ?? raw.trangThai,
    DuAn_ID: raw.DuAn_ID ?? raw.duAnId,
  };
}

function normalizeSubProjectFromApi(raw) {
  if (!raw) return null;
  return {
    DuAnID: raw.DuAnID ?? raw.duAnId,
    TenDuAn: raw.TenDuAn ?? raw.tenDuAn,
    TrangThai: raw.TrangThai ?? raw.trangThai,
  };
}
function createCustomIcon(color, zoomLevel = 10) {
  const size = Math.max(8, zoomLevel * 1);
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color:${color};
      border:2px solid white;
      border-radius:50%;
      width:${size}px;
      height:${size}px;
    "></div>`,
    iconSize: [size, size],
  });
}

const ZoomAwareMarker = ({ position, color, children }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom());
    map.on("zoomend", handleZoom);
    return () => map.off("zoomend", handleZoom);
  }, [map]);

  const radius = Math.max(8, Math.round(zoom * 1.4));
  return (
    <CircleMarker
      center={position}
      radius={radius}
      pathOptions={{
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }}
    >
      {children}
    </CircleMarker>
  );
};

const MapController = ({ loadingRoutes }) => {
  const map = useMap();

  useEffect(() => {
    fitVietnamView(map);
  }, [map]);

  useEffect(() => {
    if (!loadingRoutes) {
      fitVietnamView(map);
    }
  }, [loadingRoutes, map]);

  useEffect(() => {
    const createVietnamMask = () => {
      if (map._maskLayer) {
        map.removeLayer(map._maskLayer);
      }

      const worldBounds = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
      ];

      const vietnamHoles = vietnamGeoJson.features.flatMap((feature) => {
        const coords = feature.geometry.coordinates;
        if (feature.geometry.type === 'Polygon') {
          return coords.map((ring) => ring.map(([lng, lat]) => [lat, lng]));
        }
        return coords.flatMap((poly) =>
          poly.map((ring) => ring.map(([lng, lat]) => [lat, lng]))
        );
      });

      map._maskLayer = L.polygon([worldBounds, ...vietnamHoles], {
        fillColor: '#000',
        fillOpacity: 0.5,
        weight: 0,
        interactive: false,
      }).addTo(map);
    };

    createVietnamMask();

    return () => {
      if (map._maskLayer) {
        map.removeLayer(map._maskLayer);
      }
    };
  }, [map]);

  useEffect(() => {
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [map]);

  return null;
};

const formatDate = (dateString) => {
  if (!dateString) return "Chưa có thông tin";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
};

const getStatusColor = (status) => {
  switch (status) {
    case "Đang thi công":
      return "#4CAF50";
    case "Đang chuẩn bị":
      return "#2196F3";
    case "Hoàn thành":
      return "#FFC107";
    case "Tạm dừng":
      return "#9C27B0";
    case "Chậm tiến độ":
    case "Chậm tiến độ":
      return "#F44336";
    case "Đang hoàn thiện hồ sơ đầu tư":
      return "#607D8B";
    default:
      return "#795548";
  }
};

const MapComponent = ({ projects = [] }) => {
  const navigate = useNavigate();
  const handleViewDetail = (duAnId) => {
    navigate(`/side-project/${duAnId}`);
  };

  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeErrors, setRouteErrors] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [mapType, setMapType] = useState("standard");
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState("all");

  const [viewMode, setViewMode] = useState("all"); // all | parent | sub | goithau
  const [displayedLayers, setDisplayedLayers] = useState([]);

  const mapTypes = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  };

  const projectTypes = [
    { value: "all", label: "Tất cả dự án" },
    { value: "completed", label: "Đã hoàn thành" },
    { value: "in-progress", label: "Đang triển khai" },
    { value: "planned", label: "Dự kiến/Chờ khởi công" },
    { value: "delayed", label: "Chậm tiến độ" },
  ];

  const generateColorForProject = (parentId) => {
    const colors = [
      "#FF5733",
      "#33FF57",
      "#3357FF",
      "#F333FF",
      "#FF33A8",
      "#33FFF5",
      "#8F33FF",
      "#FF8F33",
      "#33FF8F",
      "#FF338F",
    ];
    const hash = parentId
      ? parentId
          .toString()
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : 0;
    return colors[hash % colors.length];
  };

  const parseCoordinate = (coord) => {
    if (coord === null || coord === undefined) return null;
    const num = typeof coord === "string" ? parseFloat(coord) : coord;
    return isNaN(num) ? null : num;
  };

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
  const resolveKmlUrl = (kmlPath) => {
    if (!kmlPath) return null;
    if (/^https?:\/\//i.test(kmlPath)) return kmlPath;
    const rawBase =
      API_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
    const base = rawBase.replace(/\/$/, "");
    const normalizedPath = kmlPath.startsWith("/") ? kmlPath : `/${kmlPath}`;
    return `${base}${normalizedPath}`;
  };

  const getPublicKmlUrls = (goiThauId, duAnId) => {
    if (typeof window === "undefined") return [];
    const base = `${window.location.origin}${process.env.PUBLIC_URL || ""}`.replace(/\/$/, "");
    const urls = [];
    if (goiThauId) urls.push(`${base}/kml/goithau-${goiThauId}.kml`);
    if (duAnId) urls.push(`${base}/kml/project-${duAnId}.kml`);
    if (duAnId) urls.push(`${base}/kml/subProject-${duAnId}.kml`);
    return urls;
  };

  /** URL KML cho từng gói thầu: local trước, API sau (tránh 404 ồn + không dùng project-{id}.kml cho gói lẻ) */
  const getGoiThauKmlUrls = (goiThau) => {
    const urls = [];
    const gtId = goiThau?.GoiThau_ID ?? extractGoiThauIdFromPath(goiThau?.PathData);
    if (gtId) {
      getPublicKmlUrls(gtId, null).forEach((url) => {
        if (!urls.includes(url)) urls.push(url);
      });
    }
    const apiUrl = resolveKmlUrl(goiThau?.PathData);
    if (apiUrl && !urls.includes(apiUrl)) urls.push(apiUrl);
    return urls;
  };

  const getKmlCandidateUrls = (goiThau, projectId) => getGoiThauKmlUrls(goiThau);

  const enrichProjectGoiThau = async (project) => {
    if (collectAllGoiThau(project).length > 0) return project;

    try {
      const res = await axios.get(`${API_BASE_URL}/duAn/${project.DuAnID}/detail`);
      const detail = res.data?.data;
      if (!detail) return project;

      const subProjects = (detail.duAnThanhPhan || []).map((sub) => ({
        DuAnID: sub.duAnId,
        TenDuAn: sub.tenDuAn,
        TrangThai: project.TrangThai,
        danhSachGoiThau: (sub.danhSachGoiThau || []).map((gt) => {
          const gtId = gt.goiThauId;
          const pathFromList = (project.kmlPaths || []).find(
            (p) => extractGoiThauIdFromPath(p) === gtId
          );
          return normalizeGoiThauFromApi({
            GoiThau_ID: gtId,
            TenGoiThau: gt.tenGoiThau,
            Km_BatDau: gt.kmBatDau,
            Km_KetThuc: gt.kmKetThuc,
            ToaDo_BatDau_X: gt.toaDoBatDau?.x,
            ToaDo_BatDau_Y: gt.toaDoBatDau?.y,
            ToaDo_KetThuc_X: gt.toaDoKetThuc?.x,
            ToaDo_KetThuc_Y: gt.toaDoKetThuc?.y,
            PathData: pathFromList || gt.pathData,
            TrangThai: gt.trangThai,
            DuAn_ID: sub.duAnId,
          });
        }),
      }));

      if (subProjects.length === 0) return project;

      return {
        ...project,
        danhSachDuAnThanhPhan: subProjects,
      };
    } catch (error) {
      console.warn(`enrichProjectGoiThau ${project.DuAnID}:`, error.message);
      return project;
    }
  };

  const getGoiThauCoords = (goiThau) => {
    const startLat = parseCoordinate(goiThau?.ToaDo_BatDau_Y);
    const startLng = parseCoordinate(goiThau?.ToaDo_BatDau_X);
    const endLat = parseCoordinate(goiThau?.ToaDo_KetThuc_Y);
    const endLng = parseCoordinate(goiThau?.ToaDo_KetThuc_X);
    const start =
      [startLat, startLng].every((c) => c !== null) ? [startLat, startLng] : null;
    const end = [endLat, endLng].every((c) => c !== null) ? [endLat, endLng] : null;
    return { start, end };
  };

  const fetchOsrmRoute = async (start, end) => {
    if (!start || !end) return null;
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes?.length > 0) {
        return data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]);
      }
    } catch (error) {
      console.warn("OSRM route error:", error);
    }
    return [start, end];
  };

  const resolveRouteSegments = async (goiThau, projectId) => {
    for (const url of getKmlCandidateUrls(goiThau, projectId)) {
      const kmlSegments = await parseKmlToPaths(url);
      if (kmlSegments) return kmlSegments;
    }
    const { start, end } = getGoiThauCoords(goiThau);
    if (start && end) {
      const osrmRoute = await fetchOsrmRoute(start, end);
      if (osrmRoute?.length >= 2) return [osrmRoute.filter(isValidCoord)];
    }
    return null;
  };

  const resolveProjectLevelSegments = async (project) => {
    for (const url of getPublicKmlUrls(null, project.DuAnID)) {
      const segments = await parseKmlToPaths(url);
      if (segments) return segments;
    }
    return null;
  };

  const collectAllGoiThau = (project) => {
    const items = [];
    const directPackages =
      project.danhSachGoiThauTrucTiep || project.goiThauTrucTiep || [];
    directPackages.forEach((goiThau) => {
      if (goiThau) items.push({ goiThau, subProject: null, parentProject: project });
    });

    const subProjects =
      project.danhSachDuAnThanhPhan || project.duAnThanhPhan || [];
    subProjects.forEach((subProject) => {
      const packages = subProject.danhSachGoiThau || subProject.goiThau || [];
      packages.forEach((goiThau) => {
        if (goiThau) {
          items.push({ goiThau, subProject, parentProject: project });
        }
      });
    });

    return items;
  };

  const isValidLat = (lat) => typeof lat === 'number' && isFinite(lat) && lat >= -90 && lat <= 90;
  const isValidLng = (lng) => typeof lng === 'number' && isFinite(lng) && lng >= -180 && lng <= 180;
  const toLatLngPoint = (coord) => {
    if (!Array.isArray(coord) || coord.length < 2) return null;
    const lng = parseFloat(coord[0]);
    const lat = parseFloat(coord[1]);
    if (!isValidLat(lat) || !isValidLng(lng)) return null;
    return [lat, lng];
  };
  const sanitizeSegment = (segment) => {
    if (!Array.isArray(segment)) return [];
    const cleaned = segment
      .map(toLatLngPoint)
      .filter((pt) => Array.isArray(pt) && pt.length === 2);
    // Ensure at least 2 points
    return cleaned.length >= 2 ? cleaned : [];
  };
  const isLikelyKmlText = (text) => {
    const sample = String(text || "")
      .trim()
      .slice(0, 500)
      .toLowerCase();
    return sample.includes("<kml") && !sample.includes("<!doctype html");
  };

  const parseKmlToPaths = async (kmlUrl) => {
    try {
      const res = await fetch(kmlUrl);
      if (!res.ok) return null;

      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      if (contentType.includes("text/html")) return null;

      const kmlText = await res.text();
      if (!isLikelyKmlText(kmlText)) return null;

      const kmlDom = new DOMParser().parseFromString(kmlText, "text/xml");
      const geoJsonData = kml(kmlDom);
      let segments = [];

      (geoJsonData.features || []).forEach((feature) => {
        const geom = feature.geometry;
        if (!geom) return;
        switch (geom.type) {
          case "LineString":
            segments.push(sanitizeSegment(geom.coordinates));
            break;
          case "MultiLineString":
            geom.coordinates.forEach((line) => segments.push(sanitizeSegment(line)));
            break;
          case "Polygon":
            if (Array.isArray(geom.coordinates?.[0])) {
              segments.push(sanitizeSegment(geom.coordinates[0]));
            }
            break;
          case "MultiPolygon":
            geom.coordinates.forEach((poly) => {
              if (Array.isArray(poly?.[0])) {
                segments.push(sanitizeSegment(poly[0]));
              }
            });
            break;
          default:
            break;
        }
      });

      segments = segments.filter((seg) => Array.isArray(seg) && seg.length >= 2);
      return segments.length > 0 ? segments : null;
    } catch (e) {
      return null;
    }
  };

  const getStartEndFromSegments = (segments) => {
    if (!segments || segments.length === 0) return { start: null, end: null };
    // Find first non-empty segment
    const firstSeg = segments.find((seg) => Array.isArray(seg) && seg.length >= 1) || [];
    // Find last non-empty segment
    const lastSeg = [...segments].reverse().find((seg) => Array.isArray(seg) && seg.length >= 1) || [];
    const start = firstSeg.length > 0 ? firstSeg[0] : null;
    const end = lastSeg.length > 0 ? lastSeg[lastSeg.length - 1] : null;
    return { start, end };
  };

  /** Chuyển Km568+200 -> 568.2 để sắp xếp gói thầu theo lý trình */
  const parseKmValue = (kmStr) => {
    if (kmStr == null || kmStr === "") return null;
    const normalized = String(kmStr).replace(/^km\s*/i, "").trim().replace(",", ".");
    const chainage = normalized.match(/(\d+)\+(\d+(?:\.\d+)?)/);
    if (chainage) {
      return parseFloat(chainage[1]) + parseFloat(chainage[2]) / 1000;
    }
    const num = parseFloat(normalized);
    return Number.isFinite(num) ? num : null;
  };

  const getGoiThauSortKey = (goiThau, fallbackIndex = 0) => {
    const kmStart = parseKmValue(goiThau?.Km_BatDau);
    if (kmStart != null) return kmStart;
    const id = Number(goiThau?.GoiThau_ID);
    if (Number.isFinite(id)) return id;
    return fallbackIndex;
  };

  /** Gộp nhiều KML gói thầu thành một tuyến liên tục (sắp theo Km_BatDau) */
  const mergePackageSegments = (packages) => {
    if (!packages?.length) return null;
    const sorted = [...packages].sort(
      (a, b) => getGoiThauSortKey(a.goiThau, a.order) - getGoiThauSortKey(b.goiThau, b.order)
    );
    const merged = [];
    sorted.forEach(({ segments }) => {
      (segments || []).forEach((seg) => {
        if (Array.isArray(seg) && seg.length >= 2) merged.push(seg);
      });
    });
    return merged.length > 0 ? merged : null;
  };

  const buildMergedRoute = ({
    id,
    routeType,
    name,
    parentId,
    projectData,
    parentProject,
    rootProject,
    subProject,
    status,
    path,
    kmBatDau,
    kmKetThuc,
  }) => {
    const { start, end } = getStartEndFromSegments(path);
    const rootId = rootProject?.DuAnID ?? parentId;
    return {
      id,
      routeType,
      isFromSubProject: Boolean(subProject),
      parentId,
      name,
      start,
      end,
      path,
      projectData,
      parentProject: subProject || parentProject || rootProject,
      rootProject,
      color: generateColorForProject(rootId),
      statusColor: getStatusColor(status),
      parentProjectName: subProject?.TenDuAn || parentProject?.TenDuAn || rootProject?.TenDuAn,
      status,
      kmBatDau,
      kmKetThuc,
      kmlFile: null,
    };
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true);
      setRouteErrors([]);
      const newRoutes = [];
      const errors = [];

      const enrichedProjects = await Promise.all(
        projects.map((project) => enrichProjectGoiThau(project))
      );

      for (const project of enrichedProjects) {
        try {
          const allGoiThau = collectAllGoiThau(project);
          const resolvedPackages = [];

          for (let i = 0; i < allGoiThau.length; i++) {
            const item = allGoiThau[i];
            const segments = await resolveRouteSegments(item.goiThau, project.DuAnID);
            if (!segments) continue;
            resolvedPackages.push({
              ...item,
              segments,
              order: i,
            });
          }

          // Fallback: API chỉ trả kmlPaths, chưa trả chi tiết gói thầu
          if (
            resolvedPackages.length === 0 &&
            Array.isArray(project.kmlPaths) &&
            project.kmlPaths.length > 0
          ) {
            for (let idx = 0; idx < project.kmlPaths.length; idx++) {
              const kmlPath = project.kmlPaths[idx];
              if (!kmlPath) continue;
              const gtId = extractGoiThauIdFromPath(kmlPath);
              const goiThau = {
                PathData: kmlPath,
                GoiThau_ID: gtId ?? idx,
                Km_BatDau: null,
                DuAn_ID: project.DuAnID,
              };
              const segments = await resolveRouteSegments(goiThau, project.DuAnID);
              if (!segments) continue;
              resolvedPackages.push({
                goiThau,
                subProject: null,
                parentProject: project,
                segments,
                order: idx,
              });
            }
          }

          // Fallback cuối: KML tổng hợp local project-{id}.kml
          if (resolvedPackages.length === 0) {
            const projectSegments = await resolveProjectLevelSegments(project);
            if (projectSegments) {
              newRoutes.push(
                buildMergedRoute({
                  id: `project-${project.DuAnID}`,
                  routeType: "project",
                  name: project.TenDuAn,
                  parentId: project.DuAnID,
                  projectData: project,
                  parentProject: project,
                  rootProject: project,
                  subProject: null,
                  status: project.TrangThai,
                  path: projectSegments,
                })
              );
              continue;
            }
          }

          if (resolvedPackages.length === 0) continue;

          // Dự án tổng: nối TẤT CẢ gói thầu (trực tiếp + thuộc dự án con) thành 1 tuyến
          const parentMerged = mergePackageSegments(resolvedPackages);
          if (parentMerged) {
            newRoutes.push(
              buildMergedRoute({
                id: `project-${project.DuAnID}`,
                routeType: "project",
                name: project.TenDuAn,
                parentId: project.DuAnID,
                projectData: project,
                parentProject: project,
                rootProject: project,
                subProject: null,
                status: project.TrangThai,
                path: parentMerged,
              })
            );
          }

          // Dự án thành phần: mỗi dự án con nối các gói thầu của nó thành 1 tuyến
          const subProjects =
            project.danhSachDuAnThanhPhan || project.duAnThanhPhan || [];
          for (const subProject of subProjects) {
            const subPackages = resolvedPackages.filter(
              (pkg) => pkg.subProject?.DuAnID === subProject.DuAnID
            );
            const subMerged = mergePackageSegments(subPackages);
            if (!subMerged) continue;

            newRoutes.push(
              buildMergedRoute({
                id: `subproject-${subProject.DuAnID}`,
                routeType: "subproject",
                name: subProject.TenDuAn,
                parentId: subProject.DuAnID,
                projectData: subProject,
                parentProject: project,
                rootProject: project,
                subProject,
                status: subProject.TrangThai || project.TrangThai,
                path: subMerged,
              })
            );
          }

          // Gói thầu: từng gói riêng lẻ (như trang Detail)
          for (const { goiThau, subProject, parentProject, segments } of resolvedPackages) {
            const isFromSubProject = Boolean(subProject);
            newRoutes.push(
              buildMergedRoute({
                id: `goithau-${goiThau.GoiThau_ID ?? goiThau.PathData}`,
                routeType: "goithau",
                name: goiThau.TenGoiThau || project.TenDuAn,
                parentId: isFromSubProject ? subProject.DuAnID : parentProject.DuAnID,
                projectData: goiThau,
                parentProject: isFromSubProject ? subProject : parentProject,
                rootProject: project,
                subProject: isFromSubProject ? subProject : null,
                status:
                  goiThau.TrangThai ||
                  subProject?.TrangThai ||
                  parentProject.TrangThai,
                path: segments,
                kmBatDau: goiThau.Km_BatDau,
                kmKetThuc: goiThau.Km_KetThuc,
              })
            );
          }
        } catch (error) {
          errors.push(`Lỗi xử lý dự án ${project.TenDuAn}: ${error.message}`);
          console.error(`Error processing project ${project.TenDuAn}:`, error);
        }
      }

      setRoutes(newRoutes);
      setRouteErrors(errors);
      setLoadingRoutes(false);
    };

    if (projects.length > 0) {
      fetchRoutes();
    } else {
      setRoutes([]);
    }
  }, [projects]);

  const formatKmLine = (route) => {
    const start = route?.kmBatDau ?? route?.projectData?.Km_BatDau;
    const end = route?.kmKetThuc ?? route?.projectData?.Km_KetThuc;
    if (!start && !end) return null;
    return `(${start || "?"} - ${end || "?"})`;
  };

  const routeTooltip = (route) => (
    <Tooltip
      sticky
      direction="top"
      opacity={1}
      interactive
      className="route-segment-tooltip"
      maxWidth={320}
    >
      <div className="route-tooltip-inner">
        <div className="route-popup-sub">{route.name}</div>
        {formatKmLine(route) && (
          <div className="route-popup-km">{formatKmLine(route)}</div>
        )}
        {route.parentProjectName && route.routeType !== "project" && (
          <div className="route-popup-contractor">Dự án: {route.parentProjectName}</div>
        )}
        <div className="route-popup-status">
          <span className="route-popup-dot" style={{ background: route.statusColor }} />
          {route.status}
        </div>
      </div>
    </Tooltip>
  );
  const formatCoordinate = (coord) => {
    if (coord === null || coord === undefined) return "N/A";
    const num = typeof coord === "number" ? coord : parseFloat(coord);
    return isNaN(num) ? "N/A" : num.toFixed(6);
  };

  const handlePolylineClick = (route) => {
    setActiveRoute(route);
    setShowSidePanel(true);
  };

  const calculateDistance = (path) => {
    if (!path) return 0;

    // Hỗ trợ cả mảng điểm hoặc mảng segment
    const segments = Array.isArray(path?.[0]?.[0]) ? path : [path];
    let distance = 0;
    for (const seg of segments) {
      if (!Array.isArray(seg) || seg.length < 2) continue;
      for (let i = 1; i < seg.length; i++) {
        const [lat1, lng1] = seg[i - 1] || [];
        const [lat2, lng2] = seg[i] || [];
        if (
          typeof lat1 === 'number' && isFinite(lat1) &&
          typeof lng1 === 'number' && isFinite(lng1) &&
          typeof lat2 === 'number' && isFinite(lat2) &&
          typeof lng2 === 'number' && isFinite(lng2)
        ) {
          distance += calculateHaversineDistance(lat1, lng1, lat2, lng2);
        }
      }
    }
    return (distance / 1000).toFixed(2); // Convert to km
  };

  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setActiveRoute(null);
  };

  const filteredRoutes = routes.filter((route) => {
    // Bộ lọc trạng thái dự án
    const statusMatch =
      selectedProjectType === "all"
        ? true
        : selectedProjectType === "completed"
        ? route.status === "Đã hoàn thành"
        : selectedProjectType === "in-progress"
        ? route.status === "Đang triển khai"
        : selectedProjectType === "planned"
        ? route.status?.includes("Dự kiến") || route.status?.includes("chờ khởi công")
        : selectedProjectType === "delayed"
        ? route.status?.includes("chậm tiến độ") || route.status === "Chậm tiến độ"
        : true;

    // Bộ lọc theo view: parent | sub | goithau | all
    let viewModeMatch = true;
    if (viewMode === "parent") {
      viewModeMatch = route.routeType === "project";
    } else if (viewMode === "sub") {
      viewModeMatch = route.routeType === "subproject";
    } else if (viewMode === "goithau") {
      viewModeMatch = route.routeType === "goithau";
    } else if (viewMode === "all") {
      if (route.routeType === "subproject") {
        viewModeMatch = true;
      } else if (route.routeType === "project") {
        const rootId = route.parentId;
        const hasSubs = routes.some(
          (r) => r.routeType === "subproject" && r.rootProject?.DuAnID === rootId
        );
        viewModeMatch = !hasSubs;
      } else {
        viewModeMatch = false;
      }
    }

    return statusMatch && viewModeMatch;
  });

  const focusPoints = useMemo(
    () =>
      filteredRoutes.flatMap((route) => {
        const p = route.path;
        if (!p) return [];
        const segments = Array.isArray(p?.[0]?.[0]) ? p : [p];
        return segments.flat().filter(isValidCoord);
      }),
    [filteredRoutes]
  );


  return (
    <div className="map-app-container">
      <div className="map-controls">
        <div className="map-type-selector">
          <label className="text-white" htmlFor="map-type">
            Loại Bản đồ:
          </label>
          <select
            id="map-type"
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
          >
            <option className="text-black" value="standard">
              Tiêu chuẩn
            </option>
            <option className="text-black" value="satellite">
              Vệ tinh
            </option>
            <option className="text-black" value="terrain">
              Địa hình
            </option>
            <option className="text-black" value="dark">
              Tối
            </option>
          </select>
        </div>

        <div className="map-type-selector">
          <label className="text-white" htmlFor="route-view-mode">
            Hiển thị tuyến:
          </label>
          <select
            id="route-view-mode"
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option className="text-black" value="all">
              Tất cả
            </option>
            <option className="text-black" value="parent">
              Dự án cha
            </option>
            <option className="text-black" value="sub">
              Dự án thành phần
            </option>
            <option className="text-black" value="goithau">
              Gói thầu
            </option>
          </select>
        </div>
      </div>

      <div className="map-content">
        <div
          className={`map-container ${showSidePanel ? "with-side-panel" : ""}`}
        >
          {!loadingRoutes && projects.length > 0 && filteredRoutes.length === 0 && (
            <div className="map-empty-overlay">
              <div>
                <strong>Không có tuyến hiển thị</strong>
                <p>Thử đổi bộ lọc hoặc chọn &quot;Dự án cha&quot; / &quot;Gói thầu&quot;.</p>
              </div>
            </div>
          )}
          {routeErrors.length > 0 && (
            <div className="route-errors">
              <h4>Cảnh báo:</h4>
              <ul>
                {routeErrors.slice(0, 3).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {routeErrors.length > 3 && (
                  <li>...và {routeErrors.length - 3} cảnh báo khác</li>
                )}
              </ul>
            </div>
          )}

          <div className="absolute top-4 right-4 bg-white min-w-[160px] min-h-[100px] z-[1000] rounded-xl border-2 border-blue-700 p-2">
            <div className="font-semibold">GHI CHÚ</div>
            <p className="text-xs text-gray-600 mb-2">Mỗi dự án một màu tuyến riêng</p>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-[3px] w-8 bg-[#f97316]"></span>
              <span>Điểm đầu tuyến</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-[3px] w-8 bg-[#22c55e]"></span>
              <span>Điểm cuối tuyến</span>
            </div>
          </div>

          <MapContainer
            center={VIETNAM_CENTER}
            zoom={VIETNAM_ZOOM}
            scrollWheelZoom={true}
            className="leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={mapTypes[mapType]}
            />

            {loadingRoutes && (
              <div className="map-loading-overlay">
                <div className="spinner"></div>
                <div>Đang tải bản đồ...</div>
              </div>
            )}

            <MapController loadingRoutes={loadingRoutes} />

            {filteredRoutes.map((route) => (
                <React.Fragment key={`${route.id}-${viewMode}`}>
                  {route.kmlFile ? (
                    <KmlLayer
                      key={`${route.id}-${viewMode}`}
                      layerKey={`${route.id}-${viewMode}`}
                      url={route.kmlFile}
                      color={route.color}
                      onClick={() => handlePolylineClick(route)}
                    />
                  ) : (() => {
                    const p = route.path;
                    if (!p) return null;
                    const segments = Array.isArray(p?.[0]?.[0]) ? p : [p];
                    return (
                      <>
                        {segments
                          .map((seg) => seg.filter(isValidCoord))
                          .filter((seg) => seg.length >= 2)
                          .map((seg, idx) => (
                            <Polyline
                              key={`${route.id}-${viewMode}-${idx}`}
                              positions={seg}
                              pathOptions={{
                                color: route.color,
                                weight: PROJECT_LINE_WEIGHT,
                                opacity: 1,
                                lineJoin: "round",
                                lineCap: "round",
                              }}
                              eventHandlers={{ click: () => handlePolylineClick(route) }}
                            >
                              {idx === 0 ? routeTooltip(route) : null}
                            </Polyline>
                          ))}
                      </>
                    );
                  })()}

                  {Array.isArray(route.start) && route.start.length === 2 && (
                    <Marker
                      position={route.start}
                      icon={createRoutePinIcon("#f97316")}
                      zIndexOffset={2500}
                    >
                      <Popup>
                        <div className="marker-popup">
                          <h3>{route.name}</h3>
                          <div className="popup-section">
                            <strong>Điểm đầu</strong>
                            {formatKmLine(route) && <p>{formatKmLine(route)}</p>}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {Array.isArray(route.end) && route.end.length === 2 && (
                    <Marker
                      position={route.end}
                      icon={createRoutePinIcon("#22c55e")}
                      zIndexOffset={2500}
                    >
                      <Popup>
                        <div className="marker-popup">
                          <h3>{route.name}</h3>
                          <div className="popup-section">
                            <strong>Điểm cuối</strong>
                            {formatKmLine(route) && <p>{formatKmLine(route)}</p>}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </React.Fragment>
              ))}
          </MapContainer>
        </div>

        {showSidePanel && activeRoute && (
          // Phần JSX của side-panel (thay thế phần cũ)
          <div className="side-panel">
            <button className="close-panel-btn" onClick={closeSidePanel}>
              &times;
            </button>

            <div className="panel-section">
              <h2>{activeRoute.name}</h2>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Trạng thái:</div>
                  <div
                    className="info-value"
                    style={{ color: activeRoute.statusColor || getStatusColor(activeRoute.status) }}
                  >
                    {activeRoute.status}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Tỉnh/Thành:</div>
                  <div className="info-value">
                    {activeRoute.projectData.TinhThanh || "N/A"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Chủ đầu tư:</div>
                  <div className="info-value">
                    {activeRoute.projectData.ChuDauTu || "N/A"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ngày khởi công:</div>
                  <div className="info-value">
                    {formatDate(activeRoute.projectData.NgayKhoiCong)}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Kế hoạch hoàn thành:</div>
                  <div className="info-value">
                    {formatDate(activeRoute.projectData.KeHoachHoanThanh)}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Nguồn vốn:</div>
                  <div className="info-value">
                    {activeRoute.projectData.NguonVon || "N/A"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Tổng chiều dài:</div>
                  <div className="info-value">
                    {activeRoute.projectData.TongChieuDai
                      ? `${activeRoute.projectData.TongChieuDai} km`
                      : "N/A"}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Chiều dài tuyến:</div>
                  <div className="info-value">
                    {calculateDistance(activeRoute.path)} km
                  </div>
                </div>
              </div>
              <button
                className="view-detail-btn"
                onClick={() =>
                  handleViewDetail(
                    activeRoute.parentId || activeRoute.projectData.DuAnID
                  )
                }
              >
                Xem chi tiết dự án
              </button>
            </div>

            {activeRoute.projectData.MoTaChung && (
              <div className="panel-section">
                <h3>Mô tả dự án</h3>
                <div className="info-item full-width">
                  <div className="info-value description-text">
                    {activeRoute.projectData.MoTaChung}
                  </div>
                </div>
              </div>
            )}

            {activeRoute.parentProject &&
              activeRoute.id.includes("subproject") && (
                <div className="panel-section">
                  <h3>Thông tin dự án tổng</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Tên dự án:</div>
                      <div className="info-value">
                        {activeRoute.parentProject.TenDuAn}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Trạng thái:</div>
                      <div
                        className="info-value"
                        style={{
                          color: getStatusColor(
                            activeRoute.parentProject.TrangThai
                          ),
                        }}
                      >
                        {activeRoute.parentProject.TrangThai}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Chủ đầu tư:</div>
                      <div className="info-value">
                        {activeRoute.parentProject.ChuDauTu || "N/A"}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Ngày khởi công:</div>
                      <div className="info-value">
                        {formatDate(activeRoute.parentProject.NgayKhoiCong)}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Tổng chiều dài:</div>
                      <div className="info-value">
                        {activeRoute.parentProject.TongChieuDai
                          ? `${activeRoute.parentProject.TongChieuDai} km`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  {activeRoute.parentProject.MoTaChung && (
                    <div className="info-item full-width">
                      <div className="info-label">Mô tả:</div>
                      <div className="info-value description-text">
                        {activeRoute.parentProject.MoTaChung}
                      </div>
                    </div>
                  )}
                </div>
              )}
            {activeRoute.projectData?.duAnThanhPhan?.flatMap((duAnTP) =>
              duAnTP.goiThau?.flatMap((goiThau) =>
                goiThau.hangMuc?.map((hangMuc, idx) => (
                  <div
                    key={`${hangMuc.HangMucID}-${idx}`}
                    className="info-item full-width"
                  >
                    <div
                      className="info-label"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {hangMuc.TenHangMuc}
                    </div>
                    <div
                      className="info-value"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          minWidth: "40px",
                          color:
                            parseFloat(
                              hangMuc.tienDo?.phanTramHoanThanh || 0
                            ) >= 100
                              ? "#4CAF50"
                              : parseFloat(
                                  hangMuc.tienDo?.phanTramHoanThanh || 0
                                ) > 0
                              ? "#2196F3"
                              : "#9E9E9E",
                        }}
                      >
                        {hangMuc.tienDo?.phanTramHoanThanh || 0}%
                      </span>
                      <div
                        style={{
                          flexGrow: 1,
                          height: "8px",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${hangMuc.tienDo?.phanTramHoanThanh || 0}%`,
                            height: "100%",
                            backgroundColor:
                              parseFloat(
                                hangMuc.tienDo?.phanTramHoanThanh || 0
                              ) >= 100
                                ? "#4CAF50"
                                : parseFloat(
                                    hangMuc.tienDo?.phanTramHoanThanh || 0
                                  ) > 0
                                ? "#2196F3"
                                : "#9E9E9E",
                            borderRadius: "4px",
                            transition: "width 0.3s ease",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
