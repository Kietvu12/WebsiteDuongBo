import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { DOMParser } from "@xmldom/xmldom";
import { kml } from "@tmcw/togeojson";

const KmlLayer = ({ url, color = "green", onClick, layerKey, onBoundsAvailable }) => {
  const map = useMap();

  useEffect(() => {
    if (!url || !map) return;

    const fetchAndRenderGeoJSON = async () => {
      try {
        // Xóa tất cả GeoJSON layers cũ
        map.eachLayer(layer => {
          if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
          }
        });

        // Tạo layer mới
        const response = await fetch(url);
        const kmlText = await response.text();
        const kmlDom = new DOMParser().parseFromString(kmlText, "text/xml");
        const geoJsonData = kml(kmlDom);

        const newLayer = L.geoJSON(geoJsonData, {
          style: { color, weight: 4, opacity: 0.8 },
          pointToLayer: () => null, // Quan trọng: vô hiệu hóa marker mặc định
          onEachFeature: (feature, layer) => {
            layer.on("click", e => {
              L.DomEvent.stopPropagation(e);
              onClick?.();
            });
          }
        }).addTo(map);

        // Fit bounds
        const bounds = newLayer.getBounds();
        //if (bounds.isValid()) map.fitBounds(bounds);
        if (bounds.isValid()) {
          onBoundsAvailable?.(bounds); // 🔥 Gửi bounds về cha
        }

      } catch (err) {
        console.error("Error loading KML:", err);
      }
    };

    fetchAndRenderGeoJSON();

    return () => {
      // Cleanup khi unmount
      map.eachLayer(layer => {
        if (layer instanceof L.GeoJSON) {
          map.removeLayer(layer);
        }
      });
    };
  }, [url, color, onClick, map, layerKey]);

  return null;
};

export default React.memo(KmlLayer);












// import React, { useEffect, useRef } from "react";
// import { useMap } from "react-leaflet";
// import L from "leaflet";
// import { DOMParser } from "@xmldom/xmldom";
// import { kml } from "@tmcw/togeojson";

// const KmlLayer = ({ url, color = "green", onClick, layerKey }) => {
//   const map = useMap();
//   const layerInstance = useRef(null);
//   const prevLayerKey = useRef();

//   useEffect(() => {
//     if (!url || !map) return;

//     // Tạo bản sao cục bộ của ref hiện tại
//     const currentLayer = layerInstance.current;

//     const fetchAndRenderGeoJSON = async () => {
//       try {
//         // Xóa layer cũ theo 2 cách đảm bảo chắc chắn
//         if (currentLayer) {
//           map.removeLayer(currentLayer);
//           console.log("Removed existing layer");
//         }

//         // Thêm cách 2: Xóa bằng layerGroup nếu cần
//         map.eachLayer(layer => {
//           if (layer instanceof L.GeoJSON && layer !== currentLayer) {
//             map.removeLayer(layer);
//             console.log("Removed stray GeoJSON layer");
//           }
//         });

//         const response = await fetch(url);
//         const kmlText = await response.text();
//         const kmlDom = new DOMParser().parseFromString(kmlText, "text/xml");
//         const geoJsonData = kml(kmlDom);

//         // Tạo layer mới với ID duy nhất để debug
//         const newLayer = L.geoJSON(geoJsonData, {
//           style: { color, weight: 4, opacity: 0.8 },
//           onEachFeature: (feature, layer) => {
//             layer.on("click", e => {
//               L.DomEvent.stopPropagation(e);
//               onClick?.();
//             });
//           }
//         }).addTo(map);

//         // Gán ID debug
//         newLayer._kmlLayerId = `kml-${Date.now()}`;
//         console.log(`Created new layer with ID: ${newLayer._kmlLayerId}`);

//         layerInstance.current = newLayer;
//         prevLayerKey.current = layerKey;

//         // Fit bounds
//         const bounds = newLayer.getBounds();
//         if (bounds.isValid()) map.fitBounds(bounds);

//       } catch (err) {
//         console.error("Error loading KML:", err);
//       }
//     };

//     fetchAndRenderGeoJSON();

//     return () => {
//       // Cleanup
//       if (layerInstance.current) {
//         console.log(`Cleaning up layer: ${layerInstance.current._kmlLayerId}`);
//         map.removeLayer(layerInstance.current);
//       }
      
//       // Thêm kiểm tra các layer tồn đọng
//       setTimeout(() => {
//         console.log("Current layers on map:", map._layers);
//       }, 100);
//     };
//   }, [url, color, onClick, map, layerKey]);

//   return null;
// };

// export default React.memo(KmlLayer);