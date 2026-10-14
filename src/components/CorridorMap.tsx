import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  CORRIDOR_LINE,
  LANDMARKS,
  type Period,
  pointsForPeriod,
} from "../data/corridor";
import { bikeCounterGeoJson } from "../data/bike-counter";
import bikeways from "../data/toronto-bikeways.json";

type Props = {
  period: Period;
};

function corridorBounds(): [[number, number], [number, number]] {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of CORRIDOR_LINE.geometry.coordinates) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  // Small lat pad so the thin E–W corridor isn’t a razor line.
  const latPad = (maxLat - minLat) * 2.2 + 0.008;
  return [
    [minLon - 0.004, minLat - latPad],
    [maxLon + 0.004, maxLat + latPad],
  ];
}

const CORRIDOR_BOUNDS = corridorBounds();

function fitPadding(): maplibregl.PaddingOptions {
  const mobile = typeof window !== "undefined" && window.innerWidth <= 780;
  return mobile
    ? { top: 210, bottom: 280, left: 20, right: 20 }
    : { top: 170, bottom: 230, left: 56, right: 56 };
}

function fitToCorridor(map: maplibregl.Map, animate: boolean) {
  map.fitBounds(CORRIDOR_BOUNDS, {
    padding: fitPadding(),
    duration: animate ? 1100 : 0,
    maxZoom: 13.6,
    essential: true,
  });
}

function ksiGeoJson(period: Period): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: pointsForPeriod(period).map((p, i) => {
      const kind = p.fatal
        ? "Fatal crash"
        : "Serious injury crash";
      const who = p.cyclistHurt ? "Cyclist among those hurt" : "Killed or seriously injured (any road user)";
      return {
        type: "Feature",
        id: i,
        properties: {
          fatal: p.fatal,
          cyclistHurt: p.cyclistHurt,
          year: p.year,
          title: kind,
          detail: who,
          source: "Toronto Open Data · KSI",
        },
        geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      };
    }),
  };
}

function popupHtml(title: string, lines: string[]): string {
  const body = lines
    .map((line) => `<div class="map-popup-line">${line}</div>`)
    .join("");
  return `<div class="map-popup"><strong>${title}</strong>${body}</div>`;
}

function bikewaysForPeriod(period: Period): GeoJSON.FeatureCollection {
  const cutoff = period === "before" ? 2022 : 2026;
  const features = (bikeways as GeoJSON.FeatureCollection).features.filter(
    (f) => {
      const year = (f.properties as { year?: number | null } | null)?.year;
      if (year == null) return period === "before";
      return year <= cutoff;
    },
  );
  return { type: "FeatureCollection", features };
}

export function CorridorMap({ period }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const periodRef = useRef(period);
  const readyRef = useRef(false);
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
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · City of Toronto cycling network',
            maxzoom: 19,
          },
          dim: {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [-180, -85],
                    [180, -85],
                    [180, 85],
                    [-180, 85],
                    [-180, -85],
                  ],
                ],
              },
            },
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
          {
            id: "dim",
            type: "fill",
            source: "dim",
            paint: { "fill-color": "#0c1110", "fill-opacity": 0.38 },
          },
        ],
      },
      bounds: CORRIDOR_BOUNDS,
      fitBoundsOptions: { padding: fitPadding(), maxZoom: 13.6 },
      minZoom: 10.5,
      maxZoom: 17,
      attributionControl: { compact: true },
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: false }),
      "bottom-right",
    );

    map.on("load", () => {
      map.addSource("bikeways", {
        type: "geojson",
        data: bikewaysForPeriod(periodRef.current),
      });

      map.addLayer({
        id: "bikeways-line",
        type: "line",
        source: "bikeways",
        paint: {
          "line-color": "#d6ff4a",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.2, 14, 3],
          "line-opacity": 0.45,
        },
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
      });

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
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 10, 14, 22],
          "line-opacity": periodRef.current === "after" ? 0.4 : 0.14,
          "line-blur": 5,
        },
      });

      map.addLayer({
        id: "corridor-line",
        type: "line",
        source: "corridor",
        paint: {
          "line-color": "#f4ff9a",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 7],
          "line-opacity": periodRef.current === "after" ? 1 : 0.55,
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
        maxzoom: 15,
        paint: {
          "heatmap-weight": [
            "case",
            ["get", "fatal"],
            1.4,
            ["get", "cyclistHurt"],
            1,
            0.75,
          ],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0.85,
            14,
            1.5,
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            14,
            14,
            32,
          ],
          "heatmap-opacity": 0.8,
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
        minzoom: 10.5,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11,
            ["case", ["get", "fatal"], 5, 4],
            15,
            ["case", ["get", "fatal"], 8, 6],
          ],
          "circle-color": "#ff5c5c",
          "circle-opacity": 0.95,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#0c1110",
        },
      });

      // Bigger invisible hit target for taps
      map.addLayer({
        id: "ksi-hit",
        type: "circle",
        source: "ksi",
        minzoom: 10.5,
        paint: {
          "circle-radius": 16,
          "circle-color": "#ff5c5c",
          "circle-opacity": 0,
        },
      });

      map.addSource("bike-counter", {
        type: "geojson",
        data: bikeCounterGeoJson(),
      });

      map.addLayer({
        id: "bike-counter-ring",
        type: "circle",
        source: "bike-counter",
        paint: {
          "circle-radius": 10,
          "circle-color": "#d6ff4a",
          "circle-opacity": 0.2,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#d6ff4a",
        },
      });

      map.addLayer({
        id: "bike-counter-point",
        type: "circle",
        source: "bike-counter",
        paint: {
          "circle-radius": 5,
          "circle-color": "#d6ff4a",
          "circle-opacity": 1,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#0c1110",
        },
      });

      map.addLayer({
        id: "bike-counter-hit",
        type: "circle",
        source: "bike-counter",
        paint: {
          "circle-radius": 18,
          "circle-color": "#d6ff4a",
          "circle-opacity": 0,
        },
      });

      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: "240px",
        offset: 12,
        className: "map-popup-shell",
      });
      popupRef.current = popup;

      const setPointer = () => {
        map.getCanvas().style.cursor = "pointer";
      };
      const clearPointer = () => {
        map.getCanvas().style.cursor = "";
      };

      map.on("mouseenter", "ksi-hit", setPointer);
      map.on("mouseleave", "ksi-hit", clearPointer);
      map.on("mouseenter", "bike-counter-hit", setPointer);
      map.on("mouseleave", "bike-counter-hit", clearPointer);

      map.on("click", "ksi-hit", (e) => {
        const f = e.features?.[0];
        if (!f?.geometry || f.geometry.type !== "Point") return;
        const p = f.properties ?? {};
        const coords = f.geometry.coordinates.slice() as [number, number];
        popup
          .setLngLat(coords)
          .setHTML(
            popupHtml(String(p.title ?? "Serious crash"), [
              String(p.detail ?? ""),
              `Year: ${p.year}`,
              String(p.source ?? "Toronto Open Data · KSI"),
            ]),
          )
          .addTo(map);
      });

      map.on("click", "bike-counter-hit", (e) => {
        const f = e.features?.[0];
        if (!f?.geometry || f.geometry.type !== "Point") return;
        const p = f.properties ?? {};
        const coords = f.geometry.coordinates.slice() as [number, number];
        popup
          .setLngLat(coords)
          .setHTML(
            popupHtml("Permanent bike counter", [
              String(p.site ?? p.label ?? "Bloor St W"),
              "City open data · counts people biking past this spot",
            ]),
          )
          .addTo(map);
      });

      const syncMarkers = () => {
        const show = map.getZoom() >= 12.5;
        for (const m of markersRef.current) {
          m.getElement().style.display = show ? "block" : "none";
        }
      };

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
          "display:none",
        ].join(";");
        markersRef.current.push(
          new maplibregl.Marker({ element: el, anchor: "top" })
            .setLngLat([landmark.lon, landmark.lat])
            .addTo(map),
        );
      }

      map.on("zoom", syncMarkers);
      syncMarkers();
      readyRef.current = true;
      fitToCorridor(map, false);
    });

    mapRef.current = map;
    return () => {
      readyRef.current = false;
      popupRef.current?.remove();
      popupRef.current = null;
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    const ksi = map.getSource("ksi") as maplibregl.GeoJSONSource | undefined;
    ksi?.setData(ksiGeoJson(period));
    popupRef.current?.remove();

    const ways = map.getSource("bikeways") as maplibregl.GeoJSONSource | undefined;
    ways?.setData(bikewaysForPeriod(period));

    if (map.getLayer("corridor-glow")) {
      map.setPaintProperty(
        "corridor-glow",
        "line-opacity",
        period === "after" ? 0.4 : 0.14,
      );
      map.setPaintProperty(
        "corridor-line",
        "line-opacity",
        period === "after" ? 1 : 0.55,
      );
    }

  }, [period]);

  return <div className="map-root" ref={rootRef} aria-label="Toronto map" />;
}
