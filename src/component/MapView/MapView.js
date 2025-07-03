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
    <div className="w-full h-full rounded shadow-md overflow-hidden relative">
      <div className={`${isExpanded ? 'h-[calc(100vh-44px)]' : 'h-[calc(100%)]'} w-full z-0`}>
      <MapContainer
          center={startPoint || [21.8534, 106.7615]}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full min-h-52"
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
              <div className="min-w-[180px] text-sm leading-relaxed">
                <strong className="text-[#1890ff] block mb-1 text-base">Điểm bắt đầu</strong>
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
              <div className="min-w-[180px] text-sm leading-relaxed">
                <strong className="text-[#1890ff] block mb-1 text-base">Điểm kết thúc</strong>
                <div>Dự án: {selectedProject.TenGoiThau}</div>
                <div>Km: {selectedProject.Km_KetThuc}</div>
                <div>Tọa độ: {endPoint[0].toFixed(6)}, {endPoint[1].toFixed(6)}</div>
              </div>
            </Popup>
          </Marker>
        )}
        <MapController bounds={bounds} isExpanded={isExpanded} />
      </MapContainer>
      </div>
      {isExpanded && selectedProject && (
        <div className="absolute top-5 right-5 flex flex-col gap-4 z-[1001] pointer-events-none">
          <div className="animate-[slideInFromRight_0.4s_ease_forwards] pointer-events-auto w-[550px] h-[30%]">
            <ConstructionVolume data={{ khoiLuongThiCong: selectedProject.khoiLuongThiCong }} />
          </div>
          <div className="animate-[slideInFromRight_0.4s_ease_forwards] pointer-events-auto w-[550px] h-[30%]" style={{ animationDelay: '0.1s' }}>
            <ContractorInfo data={selectedProject} />
          </div>
          <div className="animate-[slideInFromRight_0.4s_ease_forwards] pointer-events-auto w-[550PX] h-[30%]" style={{ animationDelay: '0.2s' }}>
            <ProgressChart data={selectedProject.phanTram} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;