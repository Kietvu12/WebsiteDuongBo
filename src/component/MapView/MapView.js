import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { FaMap } from 'react-icons/fa';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import ContractorInfo from '../ContractorInfo/ContractorInfo';
import ConstructionVolume from '../ConstructionVolume/ConstructionVolume';
import ProgressChart from '../ProgressChart/ProgressChart';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapController = ({ bounds, isExpanded }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [isExpanded, map]);

  return null;
};

const MapView = ({ selectedProject, isExpanded }) => {
  const [bounds, setBounds] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (selectedProject) {
        const start = [
          parseFloat(selectedProject.ToaDo_BatDau_Y),
          parseFloat(selectedProject.ToaDo_BatDau_X)
        ];
        const end = [
          parseFloat(selectedProject.ToaDo_KetThuc_Y),
          parseFloat(selectedProject.ToaDo_KetThuc_X)
        ];

        setStartPoint(start);
        setEndPoint(end);
        setBounds([start, end]);

        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          if (data.routes?.length > 0) {
            const coordinates = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRoute(coordinates);
          } else {
            setRoute([start, end]);
          }
        } catch (error) {
          console.error("Lỗi khi gọi OSRM:", error);
          setRoute([start, end]);
        }
      }
    };

    fetchRoute();
  }, [selectedProject]);

  return (
    <div className="map-container">
      <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center">
        <FaMap className="text-gray-500 mr-2" size={14} />
        <h2 className="text-base font-semibold text-gray-800">BẢN ĐỒ DỰ ÁN</h2>
      </div>
      <MapContainer
        center={startPoint || [21.8534, 106.7615]}
        zoom={13}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {route && (
          <Polyline
            positions={route}
            color="#1890ff"
            weight={4}
            opacity={0.8}
          />
        )}
        {startPoint && (
          <Marker position={startPoint}>
            <Popup>
              <div className="marker-popup">
                <strong>Điểm bắt đầu</strong>
                <div>Dự án: {selectedProject.TenGoiThau}</div>
                <div>Km: {selectedProject.Km_BatDau}</div>
                <div>Tọa độ: {startPoint[0].toFixed(6)}, {startPoint[1].toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        )}
        {endPoint && (
          <Marker position={endPoint}>
            <Popup>
              <div className="marker-popup">
                <strong>Điểm kết thúc</strong>
                <div>Dự án: {selectedProject.TenGoiThau}</div>
                <div>Km: {selectedProject.Km_KetThuc}</div>
                <div>Tọa độ: {endPoint[0].toFixed(6)}, {endPoint[1].toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        )}
        <MapController bounds={bounds} isExpanded={isExpanded} />
      </MapContainer>
      {isExpanded && selectedProject && (
        <div className="floating-info-container">
          <div className="floating-card slide-in" style={{ animationDelay: '0s' }}>
            <ConstructionVolume data={{ khoiLuongThiCong: selectedProject.khoiLuongThiCong }} />
          </div>
          <div className="floating-card slide-in" style={{ animationDelay: '0.1s' }}>
            <ContractorInfo data={selectedProject} />
          </div>
          <div className="floating-card slide-in" style={{ animationDelay: '0.2s' }}>
            <ProgressChart data={selectedProject.phanTram} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;