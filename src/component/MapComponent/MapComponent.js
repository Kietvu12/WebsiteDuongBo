import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './MapComponent.css';
import { useNavigate } from 'react-router-dom';

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color:${color}; border:2px solid white; border-radius:50%; width:16px; height:16px;"></div>`,
    iconSize: [0, 0]
  });
};

const MapController = ({ allRoutes }) => {
  const map = useMap();

  useEffect(() => {
    if (allRoutes?.length > 0) {
      try {
        const bounds = L.latLngBounds(allRoutes.flat());
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error('Error setting map bounds:', error);
      }
    }
  }, [allRoutes, map]);

  return null;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa có thông tin';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Đã hoàn thành':
      return '#4CAF50';
    case 'Đang triển khai':
      return '#2196F3';
    case 'Đã phê duyệt – chờ khởi công':
      return '#FFC107';
    case 'Dự kiến khởi công':
      return '#9C27B0';
    case 'Chậm tiến độ':
    case 'Đã phê duyệt – chậm tiến độ':
      return '#F44336';
    case 'Đang hoàn thiện hồ sơ đầu tư':
      return '#607D8B';
    default:
      return '#795548';
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
  const [mapType, setMapType] = useState('standard');
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedProjectType, setSelectedProjectType] = useState('all');

  const mapTypes = {
    standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
  };

  const projectTypes = [
    { value: 'all', label: 'Tất cả dự án' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'in-progress', label: 'Đang triển khai' },
    { value: 'planned', label: 'Dự kiến/Chờ khởi công' },
    { value: 'delayed', label: 'Chậm tiến độ' }
  ];

  const generateColorForProject = (parentId) => {
    const colors = [
      '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8',
      '#33FFF5', '#8F33FF', '#FF8F33', '#33FF8F', '#FF338F'
    ];
    const hash = parentId ? parentId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return colors[hash % colors.length];
  };

  const parseCoordinate = (coord) => {
    if (coord === null || coord === undefined) return null;
    const num = typeof coord === 'string' ? parseFloat(coord) : coord;
    return isNaN(num) ? null : num;
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true);
      setRouteErrors([]);
      const newRoutes = [];
      const errors = [];

      for (const project of projects) {
        try {
          const parentColor = generateColorForProject(project.DuAnID);

          if (project.duAnThanhPhan?.length > 0) {
            for (const subProject of project.duAnThanhPhan) {
              if (subProject?.coordinates?.start && subProject?.coordinates?.end) {
                const startLat = parseCoordinate(subProject.coordinates.start.lat);
                const startLng = parseCoordinate(subProject.coordinates.start.lng);
                const endLat = parseCoordinate(subProject.coordinates.end.lat);
                const endLng = parseCoordinate(subProject.coordinates.end.lng);

                if ([startLat, startLng, endLat, endLng].every(c => c !== null)) {
                  const startPos = [startLat, startLng];
                  const endPos = [endLat, endLng];
                  let path = [startPos, endPos];

                  try {
                    const response = await axios.get(
                      `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`,
                      { params: { overview: 'full', geometries: 'geojson' }, timeout: 5000 }
                    );
                    if (response.data?.routes?.[0]?.geometry?.coordinates) {
                      path = response.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    }
                  } catch (error) {
                    console.warn(`Không thể lấy tuyến đường chi tiết cho dự án thành phần ${subProject.TenDuAn}:`, error.message);
                  }

                  const routeId = `subproject-${subProject.DuAnID}`;
                  newRoutes.push({
                    id: routeId,
                    parentId: project.DuAnID,
                    name: subProject.TenDuAn,
                    start: startPos,
                    end: endPos,
                    path,
                    projectData: subProject,
                    parentProject: project,
                    color: parentColor,
                    parentProjectName: project.TenDuAn,
                    status: subProject.TrangThai || project.TrangThai
                  });
                }
              }
            }
          }
          if (project.coordinates?.start && project.coordinates?.end) {
            const startLat = parseCoordinate(project.coordinates.start.lat);
            const startLng = parseCoordinate(project.coordinates.start.lng);
            const endLat = parseCoordinate(project.coordinates.end.lat);
            const endLng = parseCoordinate(project.coordinates.end.lng);

            if ([startLat, startLng, endLat, endLng].every(c => c !== null)) {
              const startPos = [startLat, startLng];
              const endPos = [endLat, endLng];
              let path = [startPos, endPos];

              try {
                const response = await axios.get(
                  `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`,
                  { params: { overview: 'full', geometries: 'geojson' }, timeout: 5000 }
                );
                if (response.data?.routes?.[0]?.geometry?.coordinates) {
                  path = response.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                }
              } catch (error) {
                console.warn(`Không thể lấy tuyến đường chi tiết cho dự án ${project.TenDuAn}:`, error.message);
              }

              const routeId = `project-${project.DuAnID}`;
              newRoutes.push({
                id: routeId,
                parentId: project.DuAnID,
                name: project.TenDuAn,
                start: startPos,
                end: endPos,
                path,
                projectData: project,
                parentProject: project,
                color: parentColor,
                parentProjectName: project.TenDuAn,
                status: project.TrangThai
              });
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
    if (coord === null || coord === undefined) return 'N/A';
    const num = typeof coord === 'number' ? coord : parseFloat(coord);
    return isNaN(num) ? 'N/A' : num.toFixed(6);
  };

  const handlePolylineClick = (route) => {
    setActiveRoute(route);
    setShowSidePanel(true);
  };

  const calculateDistance = (path) => {
    if (!path || path.length < 2) return 0;

    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      const [lat1, lng1] = path[i - 1];
      const [lat2, lng2] = path[i];
      distance += calculateHaversineDistance(lat1, lng1, lat2, lng2);
    }
    return (distance / 1000).toFixed(2); // Convert to km
  };

  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setActiveRoute(null);
  };

  const filteredRoutes = routes.filter(route => {
    if (selectedProjectType === 'all') return true;
    if (selectedProjectType === 'completed') return route.status === 'Đã hoàn thành';
    if (selectedProjectType === 'in-progress') return route.status === 'Đang triển khai';
    if (selectedProjectType === 'planned') return route.status.includes('Dự kiến') || route.status.includes('chờ khởi công');
    if (selectedProjectType === 'delayed') return route.status.includes('chậm tiến độ') || route.status === 'Chậm tiến độ';
    return true;
  });

  return (
    <div className="map-app-container" style={{ height: '100%', width: '100%' }}>
      <div className="map-controls">
        <div className="map-type-selector">
          <label htmlFor="map-type">Loại Bản đồ:</label>
          <select
            id="map-type"
            value={mapType}
            onChange={(e) => setMapType(e.target.value)}
          >
            <option className='text-black' value="standard" >Tiêu chuẩn</option>
            <option className='text-black' value="satellite">Vệ tinh</option>
            <option className='text-black' value="terrain">Địa hình</option>
            <option className='text-black' value="dark">Tối</option>
          </select>
        </div>
      </div>

      <div className="map-content">
        <div className={`map-container ${showSidePanel ? 'with-side-panel' : ''}`}>
          {routeErrors.length > 0 && (
            <div className="route-errors">
              <h4>Cảnh báo:</h4>
              <ul>
                {routeErrors.slice(0, 3).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {routeErrors.length > 3 && <li>...và {routeErrors.length - 3} cảnh báo khác</li>}
              </ul>
            </div>
          )}

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

            <MapController allRoutes={filteredRoutes.map(route => route.path)} />

            {filteredRoutes.map(route => {
              const customIcon = createCustomIcon(route.color);

              return (
                <React.Fragment key={route.id}>
                  <Polyline
                    positions={route.path}
                    color={route.color}
                    weight={4}
                    eventHandlers={{
                      click: () => handlePolylineClick(route)
                    }}
                  />

                  <Marker position={route.start} icon={customIcon}>
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
                          <p>{formatCoordinate(route.start[0])}, {formatCoordinate(route.start[1])}</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  <Marker position={route.end} icon={customIcon}>
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
                          <p>{formatCoordinate(route.end[0])}, {formatCoordinate(route.end[1])}</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
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
                  <div className="info-value" style={{ color: getStatusColor(activeRoute.status) }}>
                    {activeRoute.status}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Tỉnh/Thành:</div>
                  <div className="info-value">{activeRoute.projectData.TinhThanh || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Chủ đầu tư:</div>
                  <div className="info-value">{activeRoute.projectData.ChuDauTu || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ngày khởi công:</div>
                  <div className="info-value">{formatDate(activeRoute.projectData.NgayKhoiCong)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Kế hoạch hoàn thành:</div>
                  <div className="info-value">{formatDate(activeRoute.projectData.KeHoachHoanThanh)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Nguồn vốn:</div>
                  <div className="info-value">{activeRoute.projectData.NguonVon || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Tổng chiều dài:</div>
                  <div className="info-value">
                    {activeRoute.projectData.TongChieuDai ? `${activeRoute.projectData.TongChieuDai} km` : 'N/A'}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Chiều dài tuyến:</div>
                  <div className="info-value">{calculateDistance(activeRoute.path)} km</div>
                </div>

              </div>
              <button
                className="view-detail-btn"
                onClick={() => handleViewDetail(activeRoute.parentId || activeRoute.projectData.DuAnID)}
              >
                Xem chi tiết dự án
              </button>
            </div>

            {activeRoute.projectData.MoTaChung && (
              <div className="panel-section">
                <h3>Mô tả dự án</h3>
                <div className="info-item full-width">
                  <div className="info-value description-text">{activeRoute.projectData.MoTaChung}</div>
                </div>
              </div>
            )}

            {activeRoute.parentProject && activeRoute.id.includes('subproject') && (
              <div className="panel-section">
                <h3>Thông tin dự án tổng</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Tên dự án:</div>
                    <div className="info-value">{activeRoute.parentProject.TenDuAn}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Trạng thái:</div>
                    <div className="info-value" style={{ color: getStatusColor(activeRoute.parentProject.TrangThai) }}>
                      {activeRoute.parentProject.TrangThai}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Chủ đầu tư:</div>
                    <div className="info-value">{activeRoute.parentProject.ChuDauTu || 'N/A'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Ngày khởi công:</div>
                    <div className="info-value">{formatDate(activeRoute.parentProject.NgayKhoiCong)}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Tổng chiều dài:</div>
                    <div className="info-value">
                      {activeRoute.parentProject.TongChieuDai ? `${activeRoute.parentProject.TongChieuDai} km` : 'N/A'}
                    </div>
                  </div>
                </div>
                {activeRoute.parentProject.MoTaChung && (
                  <div className="info-item full-width">
                    <div className="info-label">Mô tả:</div>
                    <div className="info-value description-text">{activeRoute.parentProject.MoTaChung}</div>
                  </div>
                )}
              </div>
            )}
            {activeRoute.projectData?.duAnThanhPhan?.flatMap(duAnTP =>
              duAnTP.goiThau?.flatMap(goiThau =>
                goiThau.hangMuc?.map((hangMuc, idx) => (
                  <div key={`${hangMuc.HangMucID}-${idx}`} className="info-item full-width">
                    <div className="info-label" style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {hangMuc.TenHangMuc}
                    </div>
                    <div className="info-value" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        fontWeight: 'bold',
                        minWidth: '40px',
                        color: parseFloat(hangMuc.tienDo?.phanTramHoanThanh || 0) >= 100 ? '#4CAF50' :
                          parseFloat(hangMuc.tienDo?.phanTramHoanThanh || 0) > 0 ? '#2196F3' : '#9E9E9E'
                      }}>
                        {hangMuc.tienDo?.phanTramHoanThanh || 0}%
                      </span>
                      <div style={{
                        flexGrow: 1,
                        height: '8px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${hangMuc.tienDo?.phanTramHoanThanh || 0}%`,
                          height: '100%',
                          backgroundColor: parseFloat(hangMuc.tienDo?.phanTramHoanThanh || 0) >= 100 ? '#4CAF50' :
                            parseFloat(hangMuc.tienDo?.phanTramHoanThanh || 0) > 0 ? '#2196F3' : '#9E9E9E',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }}></div>
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