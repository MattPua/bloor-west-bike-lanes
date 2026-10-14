import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  CORRIDOR_LINE,
  LANDMARKS,
  type Period,
  pointsForPeriod,
} from "../data/corridor";

type Props = {
  period: Period;
};

const BOUNDS: [[number, number], [number, number]] = [
  [-79.575, 43.632],
  [-79.465, 43.658],
];

function ksiGeoJson(period: Period): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: pointsForPeriod(period).map((p, i) => ({
      type: "Feature",
      id: i,
      properties: {
        fatal: p.fatal,
        cyclistHurt: p.cyclistHurt,
        year: p.year,
      },
      geometry: { type: "Point", coordinates: [p.lon, p.lat] },
    })),
  };
}

export function CorridorMap({ period }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const periodRef = useRef(period);
  periodRef.current = period;

  useEffect(() => {
    if (!rootRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: rootRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap &copy; CARTO",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      bounds: BOUNDS,
      fitBoundsOptions: { padding: 64 },
      attributionControl: { compact: true },
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: false }),
      "bottom-right",
    );

    map.on("load", () => {
      map.addSource("corridor", {
        type: "geojson",
        data: CORRIDOR_LINE,
      });

      map.addLayer({
        id: "corridor-glow",
        type: "line",
        source: "corridor",
        paint: {
          "line-color": "#d6ff4a",
          "line-width": 16,
          "line-opacity": periodRef.current === "after" ? 0.24 : 0.06,
          "line-blur": 6,
        },
      });

      map.addLayer({
        id: "corridor-line",
        type: "line",
        source: "corridor",
        paint: {
          "line-color": "#d6ff4a",
          "line-width": periodRef.current === "after" ? 5 : 2,
          "line-opacity": periodRef.current === "after" ? 0.95 : 0.35,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });

      map.addSource("ksi", {
        type: "geojson",
        data: ksiGeoJson(periodRef.current),
      });

      map.addLayer({
        id: "ksi-heat",
        type: "heatmap",
        source: "ksi",
        maxzoom: 16,
        paint: {
          "heatmap-weight": [
            "case",
            ["get", "fatal"],
            1.2,
            ["get", "cyclistHurt"],
            1,
            0.7,
          ],
          "heatmap-intensity": 1.15,
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 11, 20, 15, 40],
          "heatmap-opacity": 0.75,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.2,
            "rgba(255,92,92,0.25)",
            0.5,
            "rgba(255,92,92,0.55)",
            0.85,
            "rgba(255,140,100,0.85)",
            1,
            "rgba(255,220,160,0.95)",
          ],
        },
      });

      map.addLayer({
        id: "ksi-points",
        type: "circle",
        source: "ksi",
        paint: {
          "circle-radius": [
            "case",
            ["get", "fatal"],
            7,
            ["get", "cyclistHurt"],
            6,
            4.5,
          ],
          "circle-color": "#ff5c5c",
          "circle-opacity": 0.92,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#0c1110",
        },
      });

      for (const landmark of LANDMARKS) {
        const el = document.createElement("div");
        el.textContent = landmark.name;
        el.style.cssText = [
          "font:500 10px/1 'IBM Plex Mono',monospace",
          "color:#c5d0c8",
          "background:rgba(12,17,16,0.75)",
          "border:1px solid rgba(214,255,74,0.2)",
          "padding:3px 6px",
          "white-space:nowrap",
          "pointer-events:none",
          "transform:translateY(8px)",
        ].join(";");
        const marker = new maplibregl.Marker({ element: el, anchor: "top" })
          .setLngLat([landmark.lon, landmark.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }
    });

    mapRef.current = map;

    return () => {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    const ksi = map.getSource("ksi") as maplibregl.GeoJSONSource | undefined;
    ksi?.setData(ksiGeoJson(period));

    if (map.getLayer("corridor-glow")) {
      map.setPaintProperty(
        "corridor-glow",
        "line-opacity",
        period === "after" ? 0.24 : 0.06,
      );
      map.setPaintProperty(
        "corridor-line",
        "line-width",
        period === "after" ? 5 : 2,
      );
      map.setPaintProperty(
        "corridor-line",
        "line-opacity",
        period === "after" ? 0.95 : 0.35,
      );
    }
  }, [period]);

  return <div className="map-root" ref={rootRef} aria-label="Bloor West map" />;
}
