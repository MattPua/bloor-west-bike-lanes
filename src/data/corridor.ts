export type Period = "before" | "after";

/** Approximate centreline: Resurrection Rd → Runnymede Rd along Bloor St W */
export const CORRIDOR_LINE: GeoJSON.Feature<GeoJSON.LineString> = {
  type: "Feature",
  properties: { name: "Bloor Street West Complete Street Extension" },
  geometry: {
    type: "LineString",
    coordinates: [
      [-79.56, 43.6382],
      [-79.55, 43.6395],
      [-79.54, 43.6409],
      [-79.536, 43.6415],
      [-79.53, 43.643],
      [-79.524, 43.6446],
      [-79.519, 43.6456],
      [-79.51, 43.6472],
      [-79.505, 43.6482],
      [-79.495, 43.6495],
      [-79.486, 43.6484],
      [-79.484, 43.6493],
      [-79.476, 43.6511],
    ],
  },
};

export const LANDMARKS = [
  { name: "Resurrection", lon: -79.56, lat: 43.6382 },
  { name: "Kipling", lon: -79.536, lat: 43.6415 },
  { name: "Islington", lon: -79.524, lat: 43.6446 },
  { name: "Aberfoyle", lon: -79.519, lat: 43.6456 },
  { name: "Jane", lon: -79.484, lat: 43.6493 },
  { name: "Runnymede", lon: -79.476, lat: 43.6511 },
] as const;

/** Unique KSI collisions on Bloor in project bbox (Toronto Open Data). */
export type KsiPoint = {
  year: number;
  lon: number;
  lat: number;
  fatal: boolean;
  cyclistHurt: boolean;
};

export const KSI_POINTS: KsiPoint[] = [
  { year: 2016, lon: -79.52343, lat: 43.64464, fatal: false, cyclistHurt: false },
  { year: 2016, lon: -79.50775, lat: 43.64816, fatal: true, cyclistHurt: false },
  { year: 2017, lon: -79.47175, lat: 43.65206, fatal: true, cyclistHurt: false },
  { year: 2017, lon: -79.48444, lat: 43.64926, fatal: true, cyclistHurt: false },
  { year: 2017, lon: -79.47549, lat: 43.65129, fatal: false, cyclistHurt: false },
  { year: 2018, lon: -79.53555, lat: 43.64225, fatal: false, cyclistHurt: false },
  { year: 2018, lon: -79.47626, lat: 43.65106, fatal: false, cyclistHurt: false },
  { year: 2018, lon: -79.51133, lat: 43.64729, fatal: false, cyclistHurt: false },
  { year: 2018, lon: -79.48571, lat: 43.64824, fatal: false, cyclistHurt: false },
  { year: 2018, lon: -79.47626, lat: 43.6511, fatal: false, cyclistHurt: true },
  { year: 2019, lon: -79.48043, lat: 43.65013, fatal: false, cyclistHurt: false },
  { year: 2019, lon: -79.53952, lat: 43.64082, fatal: false, cyclistHurt: false },
  { year: 2019, lon: -79.51894, lat: 43.64559, fatal: false, cyclistHurt: true },
  { year: 2020, lon: -79.5234, lat: 43.64458, fatal: false, cyclistHurt: false },
  { year: 2020, lon: -79.51355, lat: 43.6468, fatal: false, cyclistHurt: false },
  { year: 2021, lon: -79.48444, lat: 43.64926, fatal: false, cyclistHurt: false },
  { year: 2021, lon: -79.52005, lat: 43.64535, fatal: true, cyclistHurt: false },
  { year: 2021, lon: -79.47332, lat: 43.6517, fatal: false, cyclistHurt: false },
  { year: 2021, lon: -79.51133, lat: 43.64729, fatal: false, cyclistHurt: false },
  { year: 2022, lon: -79.53952, lat: 43.64082, fatal: true, cyclistHurt: false },
  { year: 2022, lon: -79.51894, lat: 43.64559, fatal: false, cyclistHurt: false },
  { year: 2022, lon: -79.47905, lat: 43.65043, fatal: false, cyclistHurt: false },
  { year: 2023, lon: -79.51894, lat: 43.64559, fatal: true, cyclistHurt: false },
  { year: 2023, lon: -79.53415, lat: 43.64209, fatal: false, cyclistHurt: false },
  { year: 2024, lon: -79.53674, lat: 43.6415, fatal: false, cyclistHurt: false },
  { year: 2024, lon: -79.53864, lat: 43.64109, fatal: false, cyclistHurt: false },
  { year: 2025, lon: -79.4897, lat: 43.64781, fatal: false, cyclistHurt: false },
  { year: 2026, lon: -79.50774, lat: 43.64817, fatal: false, cyclistHurt: false },
];

export function pointsForPeriod(period: Period): KsiPoint[] {
  if (period === "before") {
    return KSI_POINTS.filter((p) => p.year >= 2016 && p.year <= 2022);
  }
  // After protected lanes are in (Phase 2 complete fall 2024)
  return KSI_POINTS.filter((p) => p.year >= 2024 && p.year <= 2026);
}

export function ksiPerYear(period: Period): number {
  const pts = pointsForPeriod(period);
  if (period === "before") return pts.length / 7;
  return pts.length / 3; // 2024–2026
}

/** City Fall 2026 report — PM peak end-to-end minutes (Mar–Jul). */
export const TRAVEL_TIME = {
  before: { west: 9.0, east: 9.4, label: "2022" },
  after: { west: 13.6, east: 13.1, label: "2026" },
} as const;

export function travelMinutes(period: Period): number {
  const t = TRAVEL_TIME[period];
  return (t.west + t.east) / 2;
}

/** Average of five corridor speed sites (km/h). */
export const SPEED = {
  before: [50.7, 44.3, 56.5, 59.9, 35.7],
  after: [36.75, 29.6, 42.1, 39.2, 31],
  sites: [
    "Cosmo",
    "Cliveden",
    "Kingscourt",
    "Riverside",
    "Durie",
  ],
} as const;

export function avgSpeed(period: Period): number {
  const arr = SPEED[period];
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Daily cyclists at four count sites (both directions). */
export const CYCLING = {
  before: [208, 75, 307, 756],
  after: [659, 581, 718, 1318],
  sites: ["Cliveden", "Kingscourt", "Riverside", "Durie"],
} as const;

export function totalCyclists(period: Period): number {
  return CYCLING[period].reduce((a, b) => a + b, 0);
}

export const META = {
  corridorKm: 4.7,
  phase1: "Fall 2023 · Runnymede → Aberfoyle",
  phase2: "2024 · Aberfoyle → Resurrection",
  beforeYears: "2016–2022",
  afterYears: "2024–2026",
  sources: [
    "City of Toronto — Bloor West Complete Street Extension Post-installation Data Report (Fall 2026)",
    "Toronto Open Data — Motor Vehicle Collisions Involving Killed or Seriously Injured Persons",
  ],
} as const;
