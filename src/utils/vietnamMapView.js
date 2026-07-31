import L from "leaflet";
import vietnamGeoJson from "../assets/data/vietnam.json";

/** Tâm bản đồ Việt Nam (dùng làm fallback) */
export const VIETNAM_CENTER = [16.0583, 106.85];

/** Zoom khởi tạo MapContainer — sát lãnh thổ VN hơn mức 6–7 (toàn khu vực) */
export const VIETNAM_ZOOM = 8;

let cachedVietnamBounds = null;

export function getVietnamBounds() {
  if (!cachedVietnamBounds) {
    cachedVietnamBounds = L.geoJSON(vietnamGeoJson).getBounds();
  }
  return cachedVietnamBounds;
}

/**
 * Fit bản đồ vào lãnh thổ Việt Nam (mặc định khi vào web / bấm "Việt Nam").
 */
export function fitVietnamView(map, options = {}) {
  if (!map) return;

  const {
    animate = false,
    padding = [20, 20],
    maxZoom = VIETNAM_ZOOM,
  } = options;

  try {
    const bounds = getVietnamBounds();
    if (bounds?.isValid?.()) {
      map.fitBounds(bounds, { padding, maxZoom, animate });
      if (map.getZoom() < VIETNAM_ZOOM) {
        map.setView(bounds.getCenter(), VIETNAM_ZOOM, { animate });
      }
      return;
    }
  } catch {
    // fallback below
  }

  map.setView(VIETNAM_CENTER, VIETNAM_ZOOM, { animate });
}
