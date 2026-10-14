import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  CORRIDOR_LINE,
  LANDMARKS,
  ksiSeverity,
  ksiSeverityLabel,
  type Period,
  pointsForPeriod,
} from "../data/corridor";
import { bikeCounterGeoJson } from "../data/bike-counter";
import bikeways from "../data/toronto-bikeways.json";

type Props = {
  period: Period;
};

const ICON_PX = 48;

/** Pixel icons: died = diamond+X, major = circle, cyclist = triangle. */
function makeSeverityIcon(
  kind: "fatal" | "major" | "cyclist",
): { data: Uint8Array; width: number; height: number } {
  const canvas = document.createElement("canvas");
  canvas.width = ICON_PX;
  canvas.height = ICON_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { data: new Uint8Array(ICON_PX * ICON_PX * 4), width: ICON_PX, height: ICON_PX };
  }

  ctx.clearRect(0, 0, ICON_PX, ICON_PX);
  const cx = ICON_PX / 2;
  const cy = ICON_PX / 2;

  if (kind === "fatal") {
    ctx.fillStyle = "#8b1020";
    ctx.strokeStyle = "#121411";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, 6);
    ctx.lineTo(ICON_PX - 6, cy);
    ctx.lineTo(cx, ICON_PX - 6);
    ctx.lineTo(6, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 8);
    ctx.lineTo(cx + 8, cy + 8);
    ctx.moveTo(cx + 8, cy - 8);
    ctx.lineTo(cx - 8, cy + 8);
    ctx.stroke();
  } else if (kind === "cyclist") {
    ctx.fillStyle = "#c45a2a";
    ctx.strokeStyle = "#121411";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, 7);
    ctx.lineTo(ICON_PX - 7, ICON_PX - 8);
    ctx.lineTo(7, ICON_PX - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - 6, ICON_PX - 18, 4, 0, Math.PI * 2);
    ctx.arc(cx + 6, ICON_PX - 18, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#c4102e";
    ctx.strokeStyle = "#121411";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const imageData = ctx.getImageData(0, 0, ICON_PX, ICON_PX);
  return {
    data: new Uint8Array(imageData.data),
    width: ICON_PX,
    height: ICON_PX,
  };
}

function registerCrashIcons(map: maplibregl.Map) {
  for (const kind of ["fatal", "major", "cyclist"] as const) {
    const id = `crash-${kind}`;
    if (map.hasImage(id)) continue;
    const icon = makeSeverityIcon(kind);
    map.addImage(id, icon, { pixelRatio: 2 });
  }
}

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
  // Lat pad so the thin E-W corridor is not a razor line. Keep tight for a closer default zoom.
  const latPad = (maxLat - minLat) * 1.1 + 0.0035;
  return [
    [minLon - 0.002, minLat - latPad],
    [maxLon + 0.002, maxLat + latPad],
  ];
}

const CORRIDOR_BOUNDS = corridorBounds();
const FIT_MAX_ZOOM = 14.8;

function fitPadding(): maplibregl.PaddingOptions {
  const mobile = typeof window !== "undefined" && window.innerWidth <= 780;
  return mobile
    ? { top: 190, bottom: 250, left: 14, right: 14 }
    : { top: 150, bottom: 200, left: 40, right: 40 };
}

function fitToCorridor(map: maplibregl.Map, animate: boolean) {
  map.fitBounds(CORRIDOR_BOUNDS, {
    padding: fitPadding(),
    duration: animate ? 1100 : 0,
    maxZoom: FIT_MAX_ZOOM,
    essential: true,
  });
}

function ksiGeoJson(period: Period): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: pointsForPeriod(period).map((p, i) => {
      const severity = ksiSeverity(p);
      const detail =
        severity === "cyclist"
          ? "A cyclist was seriously hurt"
          : severity === "fatal"
            ? "Someone died"
            : "Someone was badly hurt (not flagged as a cyclist in the open data)";
      return {
        type: "Feature",
        id: i,
        properties: {
          fatal: p.fatal,
          cyclistHurt: p.cyclistHurt,
          severity,
          icon: `crash-${severity}`,
          year: p.year,
          title: ksiSeverityLabel(severity),
          detail,
          source: "Toronto open crash data",
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
            paint: { "fill-color": "#1c211e", "fill-opacity": 0.22 },
          },
        ],
      },
      bounds: CORRIDOR_BOUNDS,
      fitBoundsOptions: { padding: fitPadding(), maxZoom: FIT_MAX_ZOOM },
      minZoom: 11,
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
          "line-color": "#b8d45c",
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
          "line-color": "#b8d45c",
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
          "line-color": "#d0ea7a",
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

      registerCrashIcons(map);

      map.addLayer({
        id: "ksi-heat",
        type: "heatmap",
        source: "ksi",
        maxzoom: 15,
        paint: {
          "heatmap-weight": [
            "match",
            ["get", "severity"],
            "fatal",
            1.4,
            "cyclist",
            1.1,
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
          "heatmap-opacity": 0.55,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.2,
            "rgba(196,16,46,0.2)",
            0.5,
            "rgba(196,16,46,0.45)",
            0.85,
            "rgba(196,90,42,0.7)",
            1,
            "rgba(240,192,112,0.85)",
          ],
        },
      });

      map.addLayer({
        id: "ksi-points",
        type: "symbol",
        source: "ksi",
        minzoom: 10.5,
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11,
            0.45,
            15,
            0.75,
          ],
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      });

      // Bigger invisible hit target for taps
      map.addLayer({
        id: "ksi-hit",
        type: "circle",
        source: "ksi",
        minzoom: 10.5,
        paint: {
          "circle-radius": 18,
          "circle-color": "#c4102e",
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
          "circle-color": "#b8d45c",
          "circle-opacity": 0.2,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#b8d45c",
        },
      });

      map.addLayer({
        id: "bike-counter-point",
        type: "circle",
        source: "bike-counter",
        paint: {
          "circle-radius": 5,
          "circle-color": "#b8d45c",
          "circle-opacity": 1,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#121411",
        },
      });

      map.addLayer({
        id: "bike-counter-hit",
        type: "circle",
        source: "bike-counter",
        paint: {
          "circle-radius": 18,
          "circle-color": "#b8d45c",
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
              String(p.source ?? "Toronto open crash data"),
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
            popupHtml("Bike counter", [
              String(p.site ?? p.label ?? "Bloor St W"),
              "City machine that counts people biking past this spot",
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
