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
  return pts.length / 3; // 2024 to 2026
}

/** City Fall 2026 report. PM peak end-to-end minutes (Mar to Jul). */
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

export type Cite = { label: string; href: string };

export type ContextPoint = {
  /** One-line scan title */
  headline: string;
  /** Short supporting bullets */
  bullets: string[];
  links: Cite[];
};

/** Canonical source URLs. Every on-page claim should point at one of these. */
export const LINKS = {
  fall2026: {
    label: "City Fall 2026 report",
    href: "https://www.toronto.ca/wp-content/uploads/2026/10/9905-Bloor-West-Extension-Post-Installation-Data-Report-Fall-2026-AODA.pdf",
  },
  interim2024: {
    label: "City June 2024 interim data",
    href: "https://www.toronto.ca/wp-content/uploads/2024/07/97cd-BWCEDashboardJuly-10.pdf",
  },
  projectPage: {
    label: "City Bloor West project page",
    href: "https://www.toronto.ca/services-payments/streets-parking-transportation/cycling-in-toronto/cycling-infrastructure-definitions/bloor-street-west-complete-street-extension/",
  },
  congestionPlan: {
    label: "Toronto Congestion Management Plan",
    href: "https://www.toronto.ca/services-payments/streets-parking-transportation/traffic-management/congestion-management-plan/",
  },
  ksi: {
    label: "Toronto Open Data · KSI collisions",
    href: "https://open.toronto.ca/dataset/motor-vehicle-collisions-involving-killed-or-seriously-injured-persons/",
  },
  bikeCounters: {
    label: "Toronto Open Data · permanent bicycle counters",
    href: "https://open.toronto.ca/dataset/permanent-bicycle-counters/",
  },
  pilot2017: {
    label: "2017 Bloor pilot evaluation",
    href: "https://www.toronto.ca/legdocs/mmis/2017/pw/bgrd/backgroundfile-107582.pdf",
  },
  tcat: {
    label: "TCAT Bloor economic study",
    href: "https://www.tcat.ca/wp-content/uploads/2019/08/Bloor-Economic-Impact-Study-Full-Report-updated-2019-09-03.pdf",
  },
  weBelong: {
    label: "We Belong on Bloor",
    href: "https://www.communitybikewaysto.ca/we-belong-on-bloor",
  },
  cbcInternal: {
    label: "CBC · Ontario internal docs (Mar 2025)",
    href: "https://www.cbc.ca/news/canada/toronto/ontario-bike-lanes-internal-documents-1.7481729",
  },
  onsc2025: {
    label: "Superior Court reasons (2025 ONSC 4397)",
    href: "https://ecojustice.ca/wp-content/uploads/2025/07/Cycle-Toronto-v.-AGO-Reasons-for-Judgment-PBS-July-30-2025.pdf",
  },
  cbcAppeal: {
    label: "CBC · Court of Appeal ruling (Aug 2026)",
    href: "https://www.cbc.ca/news/canada/toronto/bike-lane-removal-appeal-court-decision-9.7307310",
  },
  ontarioNewsroom: {
    label: "Ontario newsroom · restoring vehicle lanes",
    href: "https://news.ontario.ca/en/release/1007962/ontario-restoring-vehicle-lanes-on-torontos-busiest-streets",
  },
} as const satisfies Record<string, Cite>;

/** Ontario advice on removal. Short bullets; cites at the bottom. */
export const ONTARIO_ADVICE = {
  headline: "What showed up in Ontario's own record",
  bullets: [
    "Internal advice and a CIMA+ review for MTO discussed restoring car lanes",
    "That advice said congestion relief might be limited or short-lived",
    "The CIMA+ research review put a possible rise in total collisions above 54% if protected lanes came out",
    "Prior studies cited there put bike-lane collision reductions around 35% to 50%",
    "Superior Court (July 2025) recorded that the government had received this advice",
    "Court of Appeal later allowed the law to stand",
  ],
  links: [LINKS.cbcInternal, LINKS.onsc2025, LINKS.cbcAppeal],
} as const;

export const METRIC_SOURCES = {
  ksi: [LINKS.ksi],
  travel: [LINKS.fall2026],
  cyclists: [LINKS.fall2026, LINKS.bikeCounters],
} as const;

export const CHART_SOURCES = {
  speed: [LINKS.fall2026],
  cycling: [LINKS.fall2026],
  counter: [LINKS.bikeCounters],
  travel: [LINKS.fall2026],
} as const;

export const META = {
  corridorKm: 4.7,
  phase1: "Fall 2023, Runnymede to Aberfoyle",
  phase2: "2024, Aberfoyle to Resurrection",
  beforeYears: "2016 to 2022",
  afterYears: "2024 to 2026",
  /** Phase 1 interim counts: ~18k daily vehicles, under 1% change. */
  dailyVehicles: 18000,
  sources: [
    LINKS.fall2026,
    LINKS.interim2024,
    LINKS.projectPage,
    LINKS.congestionPlan,
    LINKS.ksi,
    LINKS.bikeCounters,
    LINKS.pilot2017,
    LINKS.tcat,
    LINKS.weBelong,
    LINKS.cbcInternal,
    LINKS.onsc2025,
    LINKS.cbcAppeal,
    LINKS.ontarioNewsroom,
  ],
  context: [
    {
      headline: "End-to-end drive times",
      bullets: [
        "About 2 to 5 minutes longer than 2022, depending on time of day",
        "Roughly 25 to 60 seconds per km",
      ],
      links: [LINKS.fall2026],
    },
    {
      headline: "Citywide congestion context",
      bullets: [
        "City says 2022 to 2025 rises lined up with the Travel Time Index",
        "Times on this stretch fell from 2025 to 2026",
      ],
      links: [LINKS.fall2026, LINKS.congestionPlan],
    },
    {
      headline: "Car volumes (Phase 1)",
      bullets: [
        "About 18,000 trips/day",
        "Under 1% change after install",
      ],
      links: [LINKS.interim2024],
    },
    {
      headline: "Emergency response near Phase 1",
      bullets: [
        "Paramedics +42 seconds (citywide +45 seconds)",
        "Fire 90th-percentile first truck +30 seconds locally vs +2 seconds citywide",
        "City notes a small sample for fire",
      ],
      links: [LINKS.projectPage],
    },
    {
      headline: "Permanent bike counter at Old Mill",
      bullets: [
        "May to August average +22% from 2025 to 2026",
        "Counter went live after Phase 2, so no pre-lane baseline",
      ],
      links: [LINKS.bikeCounters],
    },
    {
      headline: "Ontario documents (see earlier step)",
      bullets: [
        "Internal advice discussed congestion effects of removal",
        "CIMA+ research review discussed collision risk",
      ],
      links: [LINKS.cbcInternal, LINKS.onsc2025, LINKS.cbcAppeal],
    },
    {
      headline: "Downtown Bloor pilot (different stretch)",
      bullets: [
        "Shaw to Avenue, 2016 to 2017",
        "Cyclists +49%, motor volumes -16%",
        "TCAT study of nearby businesses: spending and customers up or stable",
      ],
      links: [LINKS.pilot2017, LINKS.tcat],
    },
  ] satisfies ContextPoint[],
} as const;
