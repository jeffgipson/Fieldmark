import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { fetchMapConfig } from "../../api/mapConfig";
import { mapDebug } from "../../utils/mapDebug";
import { L } from "./leafletSetup";

/**
 * Regrid parcel outline tiles (https://support.regrid.com/api/using-the-tileserver-api).
 * Shown on top of satellite — same data as the Regrid Property App, embedded in our Leaflet map.
 */
export default function RegridParcelLayer({ enabled }) {
  const map = useMap();
  const [tileConfig, setTileConfig] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setTileConfig(null);
      return;
    }
    let cancelled = false;
    fetchMapConfig()
      .then((cfg) => {
        if (!cancelled && cfg?.regrid_tiles) {
          mapDebug("regrid:tiles_enabled", cfg.regrid_tiles);
          setTileConfig(cfg.regrid_tiles);
        }
      })
      .catch((err) => {
        mapDebug("regrid:tiles_config_error", err?.message);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !tileConfig?.url_template) return;

    const layer = L.tileLayer(tileConfig.url_template, {
      attribution: tileConfig.attribution,
      minZoom: tileConfig.min_zoom ?? 13,
      maxZoom: tileConfig.max_zoom ?? 21,
      opacity: tileConfig.opacity ?? 0.85
    });
    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [enabled, tileConfig, map]);

  return null;
}
