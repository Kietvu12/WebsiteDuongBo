import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
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
import { LatLngBounds } from "leaflet";

import KmlLayer from "../KmlLayer";

const createCustomIcon = (color, zoomLevel = 10) => {
  const size = Math.max(8, zoomLevel * 1); // Kích thước tăng theo zoom
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
};

const ZoomAwareMarker = ({ position, color, children }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => setZoom(map.getZoom());
    map.on("zoomend", handleZoom);
    return () => map.off("zoomend", handleZoom);
  }, [map]);

  const icon = createCustomIcon(color, zoom);
  //const icon = new L.Icon.Default();

  return (
    <Marker position={position} icon={icon}>
      {children}
    </Marker>
  );
};

const MapFitBoundsController = ({ boundsList = [] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || boundsList.length === 0) return;

    const combined = boundsList.reduce(
      (acc, b) => acc.extend(b),
      new LatLngBounds()
    );

    if (combined.isValid()) {
      map.fitBounds(combined, {
        padding: [50, 50],
      });
      //console.log("fit bounds");
    }
  }, [boundsList, map]); // đảm bảo chạy lại khi mảng mới được tạo

  return null;
};

const MapController = ({ allRoutes }) => {
  const map = useMap();

  useEffect(() => {
    // Xử lý fit bounds nếu có routes
    if (allRoutes?.length > 0) {
      try {
        const validCoords = allRoutes
          .flat()
          .filter((coord) =>
            Array.isArray(coord) &&
            coord.length === 2 &&
            typeof coord[0] === 'number' && isFinite(coord[0]) &&
            typeof coord[1] === 'number' && isFinite(coord[1])
          );

        if (validCoords.length > 0) {
          const bounds = L.latLngBounds(validCoords);
          //map.fitBounds(bounds, { padding: [50, 50] });
          map.flyToBounds(bounds, {
            padding: [50, 50],
            duration: 1, // Thời gian animation (giây)
            easeLinearity: 0.25, // Độ mượt
          });
        }
      } catch (error) {
        console.error("Error setting map bounds:", error);
      }
    }

    // Tạo mask layer cho Việt Nam
    const createVietnamMask = () => {
      // Xóa layer cũ nếu tồn tại
      if (map._maskLayer) {
        map.removeLayer(map._maskLayer);
      }

      // Tạo polygon bao phủ toàn thế giới
      const worldBounds = [
        [90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180],
      ];

      // Tạo các "lỗ" từ GeoJSON Việt Nam
      const vietnamHoles = vietnamGeoJson.features.flatMap((feature) => {
        const coords = feature.geometry.coordinates;
        if (feature.geometry.type === "Polygon") {
          return coords.map((ring) => ring.map(([lng, lat]) => [lat, lng]));
        } else {
          // MultiPolygon
          return coords.flatMap((poly) =>
            poly.map((ring) => ring.map(([lng, lat]) => [lat, lng]))
          );
        }
      });

      // Tạo mask layer
      const maskLayer = L.polygon([worldBounds, ...vietnamHoles], {
        fillColor: "#000",
        fillOpacity: 0.5,
        weight: 0,
        interactive: false,
      }).addTo(map);

      map._maskLayer = maskLayer;
    };

    // Gọi hàm tạo mask
    createVietnamMask();

    // Cleanup khi unmount
    return () => {
      if (map._maskLayer) {
        map.removeLayer(map._maskLayer);
      }
    };
  }, [allRoutes, map]);

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
  const [mapCenter] = useState([21.028511, 105.804817]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeErrors, setRouteErrors] = useState([]);
  const [activeRoute, setActiveRoute] = useState(null);
  const [mapType, setMapType] = useState("standard");
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState("all");

  const [viewMode, setViewMode] = useState("parent"); // all | parent | sub
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
    const rawBase = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const baseNoSlash = rawBase.replace(/\/$/, "");
    const base = baseNoSlash.replace(/\/api$/, "");
    const path = kmlPath.startsWith("/") ? kmlPath : `/${kmlPath}`;
    return `${base}${path}`;
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
  const parseKmlToPaths = async (kmlUrl) => {
    try {
      console.log("[KML] Fetching:", kmlUrl);
      const res = await fetch(kmlUrl);
      if (!res.ok) return null;
      const kmlText = await res.text();
      console.log("[KML] Loaded:", kmlUrl, "bytes:", kmlText.length);
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

      // Remove empty segments
      segments = segments.filter((seg) => Array.isArray(seg) && seg.length >= 2);

      return segments.length > 0 ? segments : null;
    } catch (e) {
      console.warn("parseKmlToPaths error:", e.message);
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

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true);
      setRouteErrors([]);
      const newRoutes = [];
      const errors = [];

      for (const project of projects) {
        try {
          const statusColor = getStatusColor(project.TrangThai);

          // View: Dự án cha -> đọc KML trong kmlPaths và vẽ Polyline
          if (Array.isArray(project.kmlPaths)) {
            for (let idx = 0; idx < project.kmlPaths.length; idx++) {
              const kmlPath = project.kmlPaths[idx];
              if (!kmlPath) continue;
              const url = resolveKmlUrl(kmlPath);
              console.log("[KML][Project] DuAnID:", project.DuAnID, "path:", kmlPath, "url:", url);
              const segments = await parseKmlToPaths(url);
              if (!segments) continue;
              const { start, end } = getStartEndFromSegments(segments);

              newRoutes.push({
                id: `project-${project.DuAnID}-kml-${idx}`,
                routeType: "project",
                parentId: project.DuAnID,
                name: project.TenDuAn,
                start,
                end,
                path: segments,
                projectData: project,
                parentProject: project,
                color: statusColor,
                parentProjectName: project.TenDuAn,
                status: project.TrangThai,
                kmlFile: null,
              });
            }
          }

          // View: Gói thầu trực tiếp thuộc dự án cha
          if (Array.isArray(project.danhSachGoiThauTrucTiep)) {
            for (const goiThau of project.danhSachGoiThauTrucTiep) {
              const startLat = parseCoordinate(goiThau.ToaDo_BatDau_Y);
              const startLng = parseCoordinate(goiThau.ToaDo_BatDau_X);
              const endLat = parseCoordinate(goiThau.ToaDo_KetThuc_Y);
              const endLng = parseCoordinate(goiThau.ToaDo_KetThuc_X);

              const startPos =
                [startLat, startLng].every((c) => c !== null) ? [startLat, startLng] : null;
              const endPos =
                [endLat, endLng].every((c) => c !== null) ? [endLat, endLng] : null;

              // Ưu tiên đọc KML nếu có PathData
              const kmlUrl = resolveKmlUrl(goiThau.PathData);
              if (kmlUrl) {
                console.log("[KML][GoiThau-Direct] ID:", goiThau.GoiThau_ID, "path:", goiThau.PathData, "url:", kmlUrl);
              }
              const kmlSegments = kmlUrl ? await parseKmlToPaths(kmlUrl) : null;
              if (!kmlSegments) continue; // Chỉ hiển thị theo KML
              const se = getStartEndFromSegments(kmlSegments);

              newRoutes.push({
                id: `goithau-${goiThau.GoiThau_ID}`,
                routeType: "goithau",
                isFromSubProject: false,
                    parentId: project.DuAnID,
                name: goiThau.TenGoiThau,
                start: se.start,
                end: se.end,
                path: kmlSegments,
                projectData: goiThau,
                    parentProject: project,
                color: getStatusColor(goiThau.TrangThai || project.TrangThai),
                    parentProjectName: project.TenDuAn,
                status: goiThau.TrangThai || project.TrangThai,
                kmlFile: null,
                  });
                }
              }

          // View: Dự án thành phần -> lấy PathData của gói thầu thuộc dự án thành phần
          const subProjects = Array.isArray(project.danhSachDuAnThanhPhan)
            ? project.danhSachDuAnThanhPhan
            : Array.isArray(project.duAnThanhPhan)
            ? project.duAnThanhPhan
            : [];
          if (subProjects.length > 0) {
            for (const subProject of subProjects) {
              const subGoiThauList = Array.isArray(subProject.danhSachGoiThau)
                ? subProject.danhSachGoiThau
                : Array.isArray(subProject.goiThau)
                ? subProject.goiThau
                : [];
              if (subGoiThauList.length > 0) {
                for (const goiThau of subGoiThauList) {
                  const startLat = parseCoordinate(goiThau.ToaDo_BatDau_Y);
                  const startLng = parseCoordinate(goiThau.ToaDo_BatDau_X);
                  const endLat = parseCoordinate(goiThau.ToaDo_KetThuc_Y);
                  const endLng = parseCoordinate(goiThau.ToaDo_KetThuc_X);

                  const startPos =
                    [startLat, startLng].every((c) => c !== null) ? [startLat, startLng] : null;
                  const endPos =
                    [endLat, endLng].every((c) => c !== null) ? [endLat, endLng] : null;

                  // Ưu tiên đọc KML nếu có PathData
                  const kmlUrl2 = resolveKmlUrl(goiThau.PathData);
                  if (kmlUrl2) {
                    console.log("[KML][GoiThau-Sub] ID:", goiThau.GoiThau_ID, "path:", goiThau.PathData, "url:", kmlUrl2);
                  }
                  const kmlSegments2 = kmlUrl2 ? await parseKmlToPaths(kmlUrl2) : null;
                  if (!kmlSegments2) continue; // Chỉ hiển thị theo KML
                  const se2 = getStartEndFromSegments(kmlSegments2);

                  newRoutes.push({
                    id: `goithau-${goiThau.GoiThau_ID}`,
                    routeType: "goithau",
                    isFromSubProject: true,
                      parentId: subProject.DuAnID,
                      name: goiThau.TenGoiThau,
                    start: se2.start,
                    end: se2.end,
                    path: kmlSegments2,
                      projectData: goiThau,
                      parentProject: subProject,
                    color: getStatusColor(
                      goiThau.TrangThai || subProject.TrangThai || project.TrangThai
                    ),
                      parentProjectName: subProject.TenDuAn,
                      status:
                      goiThau.TrangThai || subProject.TrangThai || project.TrangThai,
                    kmlFile: null,
                    });
                  }
                }
            }
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

    // Bộ lọc theo view: parent | sub | goithau
    let viewModeMatch = true;
    if (viewMode === "parent") {
      // Dự án tổng: hiển thị tất cả KML từ kmlPaths của dự án tổng
      viewModeMatch = route.routeType === "project";
    } else if (viewMode === "sub") {
      // Dự án thành phần: chỉ hiển thị các KML thuộc gói thầu của dự án thành phần
      viewModeMatch = route.routeType === "goithau" && route.isFromSubProject === true;
    } else if (viewMode === "goithau") {
      // Gói thầu: hiển thị toàn bộ KML của gói thầu (trực tiếp và thuộc dự án thành phần)
      viewModeMatch = route.routeType === "goithau";
    }

    return statusMatch && viewModeMatch;
  });

  const boundsListRef = useRef([]);
  const [fitTrigger, setFitTrigger] = useState(0);

  // Nhận bounds từ các KML/Polyline con
  const handleBoundsFromChild = (bounds) => {
    if (!bounds?.isValid()) return;
    boundsListRef.current.push(bounds);

    if (boundsListRef.current.length === filteredRoutes.length) {
      setFitTrigger((prev) => prev + 1); // ép controller re-render
    }
  };

  // Reset lại khi filteredRoutes thay đổi
  useEffect(() => {
    boundsListRef.current = [];
    console.log("filteredRoutes: ", filteredRoutes);
  }, [filteredRoutes.length]);

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
            <div className="flex items-center space-x-2">
              <span className="inline-block h-[3px] w-8 bg-blue-600"></span>
              <span>Đang chuẩn bị</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-[3px] w-8 bg-[#33FF57]"></span>
              <span>Đang thi công</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-[3px] w-8 bg-yellow-500"></span>
              <span>Hoàn thành</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-[3px] w-8 bg-purple-500"></span>
              <span>Tạm dừng</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-[3px] w-8 bg-red-600"></span>
              <span>Chậm tiến độ</span>
            </div>
          </div>

          <MapContainer
            center={mapCenter}
            zoom={13}
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

            <MapController
              allRoutes={filteredRoutes.flatMap((route) => {
                const p = route.path;
                if (!p) return [];
                const segments = Array.isArray(p?.[0]?.[0]) ? p : [p];
                return segments.flat().filter(
                  (pt) =>
                    Array.isArray(pt) &&
                    pt.length === 2 &&
                    typeof pt[0] === 'number' && isFinite(pt[0]) &&
                    typeof pt[1] === 'number' && isFinite(pt[1])
                );
              })}
            />

            <MapFitBoundsController
              key={`fit-${fitTrigger}`} // ép re-render hoàn toàn
              boundsList={[...boundsListRef.current]} // tạo mảng mới để useEffect nhận biết
            />

            {filteredRoutes.map((route) => {
              const customIcon = createCustomIcon(route.color);

              return (
                <React.Fragment key={`${route.id}-${viewMode}`}>
                  {route.kmlFile ? (
                    <KmlLayer
                      key={`${route.id}-${viewMode}`}
                      layerKey={`${route.id}-${viewMode}`}
                      url={route.kmlFile}
                      color={route.color}
                      onClick={() => handlePolylineClick(route)}
                      onBoundsAvailable={handleBoundsFromChild}
                    />
                  ) : (() => {
                    const p = route.path;
                    if (!p) return null;
                    const segments = Array.isArray(p?.[0]?.[0]) ? p : [p];
                    return (
                      <>
                        {segments
                          .filter((seg) => Array.isArray(seg) && seg.length >= 2 && seg.every(pt => Array.isArray(pt) && pt.length === 2 && pt.every(Number.isFinite)))
                          .map((seg, idx) => (
                    <Polyline
                              key={`${route.id}-${viewMode}-${idx}`}
                              positions={seg}
                      color={route.color}
                      weight={4}
                              eventHandlers={{ click: () => handlePolylineClick(route) }}
                    />
                          ))}
                      </>
                    );
                  })()}

                  {false && Array.isArray(route.start) && route.start.length === 2 && (
                    <ZoomAwareMarker position={route.start} color={route.color}>
                      <Popup>
                        <div className="marker-popup">
                          <h3>{route.name}</h3>
                          <div className="popup-section">
                            <strong>Trạng thái:</strong>
                            <span style={{ color: getStatusColor(route.status) }}>
                              {route.status}
                            </span>
                          </div>
                          {route.parentProjectName && (
                            <div className="popup-section">
                              <strong>Thuộc dự án:</strong>
                              <p>{route.parentProjectName}</p>
                            </div>
                          )}
                          <div className="popup-section">
                            <strong>Điểm bắt đầu:</strong>
                            <p>
                              {formatCoordinate(route.start[0])}, {formatCoordinate(route.start[1])}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </ZoomAwareMarker>
                  )}

                  {false && Array.isArray(route.end) && route.end.length === 2 && (
                    <ZoomAwareMarker position={route.end} color={route.color}>
                      <Popup>
                        <div className="marker-popup">
                          <h3>{route.name}</h3>
                          <div className="popup-section">
                            <strong>Trạng thái:</strong>
                            <span style={{ color: getStatusColor(route.status) }}>
                              {route.status}
                            </span>
                          </div>
                          {route.parentProjectName && (
                            <div className="popup-section">
                              <strong>Thuộc dự án:</strong>
                              <p>{route.parentProjectName}</p>
                            </div>
                          )}
                          <div className="popup-section">
                            <strong>Điểm kết thúc:</strong>
                            <p>
                              {formatCoordinate(route.end[0])}, {formatCoordinate(route.end[1])}
                            </p>
                          </div>
                        </div>
                      </Popup>
                    </ZoomAwareMarker>
                  )}
                </React.Fragment>
              );
            })}
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
                    style={{ color: getStatusColor(activeRoute.status) }}
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