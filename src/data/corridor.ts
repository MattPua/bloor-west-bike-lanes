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

/** Map icon / legend bucket from open-data flags. */
export type KsiSeverity = "fatal" | "major" | "cyclist";

export function ksiSeverity(p: Pick<KsiPoint, "fatal" | "cyclistHurt">): KsiSeverity {
  if (p.fatal) return "fatal";
  if (p.cyclistHurt) return "cyclist";
  return "major";
}

export function ksiSeverityLabel(severity: KsiSeverity): string {
  switch (severity) {
    case "fatal":
      return "Someone died";
    case "cyclist":
      return "Cyclist badly hurt";
    default:
      return "Someone badly hurt";
  }
}

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

export function ksiYears(period: Period): number {
  return period === "before" ? 7 : 3;
}

export function ksiTotal(period: Period): number {
  return pointsForPeriod(period).length;
}

export function ksiPerYear(period: Period): number {
  return ksiTotal(period) / ksiYears(period);
}

/** If the before yearly rate held for the after window’s length. */
export function ksiProjectedAtBeforeRate(years = ksiYears("after")): number {
  return ksiPerYear("before") * years;
}

/**
 * City Fall 2026 report travel times.
 * Absolute PM peak minutes: Mar–Jul each year, Runnymede ↔ Resurrection.
 * Peak vs off-peak deltas: before vs after install (report prose).
 * Citywide: Travel Time Index (peak hour vs overnight free-flow on major corridors).
 */
export const TRAVEL_TIME = {
  before: { west: 9.0, east: 9.4, label: "2022" },
  after: { west: 13.6, east: 13.1, label: "2026" },
  /** Peak year before the 2026 ease (both directions, Mar–Jul). */
  peakYear: { west: 13.6, east: 15.2, label: "2025" },
  /** Mar–Jul weekday PM peak, both directions — report table. */
  byYear: {
    west: [9.0, 10.0, 13.1, 13.6, 13.6],
    east: [9.4, 10.0, 15.5, 15.2, 13.1],
    years: [2022, 2023, 2024, 2025, 2026],
  },
  /** Minutes added after install, by time of day (both directions). */
  changeByTimeOfDay: {
    afternoonPeak: { low: 3, high: 5, label: "Weekday afternoon (4 to 7 pm)" },
    offPeak: { low: 1, high: 3, label: "Other times of day" },
  },
  /**
   * City Travel Time Index (TTI): weekday 5-6 pm travel vs overnight free-flow.
   * Not corridor minutes. From Congestion Management Plan 2026 spring materials.
   * 1.0 = free-flow; 1.75 means ~75% longer than free-flow.
   */
  citywide: {
    metric: "Travel Time Index",
    window: "Weekday 5 to 6 pm vs overnight free-flow",
    /** Annual citywide TTI */
    tti: {
      "2024": 1.75,
      "2025": 1.72,
    },
    ttiChangePct: -2,
    downtownTti: {
      "2024": 2.12,
      "2025": 1.95,
    },
    downtownChangePct: -8,
    note:
      "Different unit than the Bloor minutes above. By 2024, citywide afternoon congestion was back near pre-pandemic.",
    shortHud:
      "Citywide afternoon Travel Time Index: 1.75 in 2024, 1.72 in 2025 (-2%)",
  },
} as const;

/**
 * City Fall 2026 “Summary of findings” — plain restatement for the City numbers step.
 * Every line should be backed by a beat below / the cited report.
 */
export const CITY_FINDINGS = {
  title: "What the City’s Fall 2026 report concluded",
  items: [
    "Fewer people killed or seriously injured within the project limits.",
    "Lower motor vehicle speeds — averages closer to the posted limit, and fewer instances of excessive speeding.",
    "Drive times rose from 2022 to 2025, in line with broader city-wide congestion, then eased on this stretch between 2025 and 2026.",
    "Increased cycling along the corridor.",
  ],
  linkKey: "fall2026" as const,
} as const;

export function travelMinutes(period: Period): number {
  const t = TRAVEL_TIME[period];
  return (t.west + t.east) / 2;
}

export function travelPeakChangeLabel(): string {
  const { low, high } = TRAVEL_TIME.changeByTimeOfDay.afternoonPeak;
  return `+${low}-${high} min`;
}

export function travelOffPeakChangeLabel(): string {
  const { low, high } = TRAVEL_TIME.changeByTimeOfDay.offPeak;
  return `+${low}-${high} min`;
}

/**
 * Vehicle speeds at five corridor sites (City Fall 2026 report).
 * Periods grouped as in the report: 2021/23 → 2024 → 2025/26.
 * Posted limit cut from 50 to 40 km/h in 2024 (Runnymede–Kipling).
 */
export const SPEED = {
  postedLimitKmh: 40,
  sites: [
    "Cosmo",
    "Cliveden",
    "Kingscourt",
    "Riverside",
    "Durie",
  ],
  /** Mean speed (km/h) */
  average: {
    before: [50.7, 44.3, 56.5, 59.9, 35.7],
    mid: [42.8, 33.8, 45.4, 48.2, 32.8],
    after: [36.75, 29.6, 42.1, 39.2, 31],
  },
  /**
   * 95th percentile (km/h) — top-end speeding.
   * Report: down ~5–20 km/h; fewer instances of excessive speeding.
   */
  p95: {
    before: [66.4, 58.3, 72.2, 74.5, 49.8],
    mid: [56.7, 48.8, 57.6, 63.5, 48.2],
    after: [53.15, 44.4, 53.15, 54.2, 44.2],
  },
  labels: {
    before: "2021/23",
    mid: "2024",
    after: "2025/26",
  },
} as const;

/** Mean of site averages for before/after (map HUD + charts). */
export function avgSpeed(period: Period): number {
  const arr = SPEED.average[period];
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Mean of 95th-percentile speeds across the five sites. */
export function avgP95Speed(period: Period): number {
  const arr = SPEED.p95[period];
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Largest site-level drop in 95th percentile (before → after), km/h. */
export function maxP95Drop(): {
  site: string;
  before: number;
  after: number;
  drop: number;
} {
  let bestSite = SPEED.sites[0] as string;
  let bestBefore = SPEED.p95.before[0] as number;
  let bestAfter = SPEED.p95.after[0] as number;
  let bestDrop = bestBefore - bestAfter;
  for (let i = 1; i < SPEED.sites.length; i++) {
    const before = SPEED.p95.before[i] as number;
    const after = SPEED.p95.after[i] as number;
    const drop = before - after;
    if (drop > bestDrop) {
      bestSite = SPEED.sites[i];
      bestBefore = before;
      bestAfter = after;
      bestDrop = drop;
    }
  }
  return {
    site: bestSite,
    before: bestBefore,
    after: bestAfter,
    drop: bestDrop,
  };
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

/**
 * Rough yearly trips if every day matched the City’s count-day total
 * across the four sites (weekday / summer-fall counts; approximate).
 */
export function cyclistsPerYearApprox(period: Period): number {
  return Math.round(totalCyclists(period) * 365);
}

export function formatApproxTrips(n: number): string {
  if (n >= 1_000_000) return `~${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `~${Math.round(n / 1000)}k`;
  return `~${n.toLocaleString()}`;
}

/**
 * Toronto Police Service Traffic Collisions Open Data, points within ~50 m
 * of the corridor centreline (Resurrection → Runnymede).
 * After window is full years 2024–2025 only (2026 still partial in the feed).
 * Flags are involvement (PEDESTRIAN / BICYCLE = YES), not exclusive modes.
 */
export const TPS_COLLISIONS = {
  bufferM: 50,
  before: {
    years: 7,
    label: "2016 to 2022",
    pedInjury: 59,
    pedInjuryPerYear: 59 / 7,
    bike: 22,
    bikePerYear: 22 / 7,
  },
  after: {
    years: 2,
    label: "2024 to 2025",
    pedInjury: 10,
    pedInjuryPerYear: 10 / 2,
    bike: 18,
    bikePerYear: 18 / 2,
  },
} as const;

export type Cite = { label: string; href: string };

export type CalloutTone = "ok" | "warn" | "amber" | "neutral";

export type Callout = {
  tone: CalloutTone;
  /** Big stressed figure or short label */
  stat: string;
  /** One plain-language line under the stat */
  text: string;
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
  congestionPlan2026: {
    label: "Congestion Management Plan 2026-2028 (TTI figures)",
    href: "https://www.toronto.ca/legdocs/mmis/2026/ie/bgrd/backgroundfile-285483.pdf",
  },
  ksi: {
    label: "Toronto open data · serious crashes",
    href: "https://open.toronto.ca/dataset/motor-vehicle-collisions-involving-killed-or-seriously-injured-persons/",
  },
  tpsCollisions: {
    label: "Toronto Police · traffic collisions open data",
    href: "https://data.torontopolice.on.ca/datasets/TorontoPS::traffic-collisions-open-data",
  },
  orsar2024: {
    label: "Ontario ORSAR · preliminary 2024 stats",
    href: "https://www.ontario.ca/document/ontario-road-safety-annual-reports-orsar/preliminary-2024-ontario-road-safety-annual-report-selected-statistics",
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
  councilIE43: {
    label: "City Council · IE4.3 (June 2023) · Bloor cycle tracks vote",
    href: "https://secure.toronto.ca/council/agenda-item.do?item=2023.IE4.3",
  },
} as const satisfies Record<string, Cite>;

/**
 * Council IE4.3 (June 14, 2023): package that authorized Bloor St W cycle tracks
 * Runnymede → Resurrection. Holyday motion tried to strip Bloor out; it lost.
 * Final adopt passed the whole package.
 */
export const COUNCIL_VOTE = {
  item: "2023.IE4.3",
  date: "June 14, 2023",
  summary:
    "City Council authorized the Bloor Street West cycle tracks (Runnymede to Resurrection) as part of a larger cycling package.",
  stripBloor: {
    label: "Holyday motion to delete Bloor from the package",
    result: "Lost 3–20",
    yes: ["Vincent Crisanti", "Stephen Holyday", "Michael Thompson"],
    no: [
      "Paul Ainslie",
      "Brad Bradford",
      "Alejandra Bravo",
      "Jon Burnside",
      "Shelley Carroll",
      "Lily Cheng",
      "Mike Colle",
      "Paula Fletcher",
      "Ausma Malik",
      "Josh Matlow",
      "Jennifer McKelvie",
      "Chris Moise",
      "Amber Morley",
      "Jamaal Myers",
      "Frances Nunziata",
      "James Pasternak",
      "Gord Perks",
      "Anthony Perruzza",
      "Jaye Robinson",
      "Dianne Saxe",
    ],
    absent: ["Gary Crawford", "Nick Mantas"],
    yesMeans: "Voted to strip Bloor out",
    noMeans: "Voted to keep Bloor in",
  },
  adopt: {
    label: "Adopt the item as amended (whole package, including Bloor)",
    result: "Carried 21–1",
    yes: [
      "Paul Ainslie",
      "Brad Bradford",
      "Alejandra Bravo",
      "Jon Burnside",
      "Shelley Carroll",
      "Lily Cheng",
      "Mike Colle",
      "Paula Fletcher",
      "Ausma Malik",
      "Josh Matlow",
      "Jennifer McKelvie",
      "Chris Moise",
      "Amber Morley",
      "Jamaal Myers",
      "Frances Nunziata",
      "James Pasternak",
      "Gord Perks",
      "Anthony Perruzza",
      "Jaye Robinson",
      "Dianne Saxe",
      "Michael Thompson",
    ],
    no: ["Stephen Holyday"],
    absent: ["Gary Crawford", "Vincent Crisanti", "Nick Mantas"],
  },
  link: "councilIE43" as const,
} as const;

/**
 * Ontario's CIMA+ / ministry advice on removing bike lanes.
 * Page needs the why first: province moved to restore car lanes; these files
 * are what its own reviewers wrote before that.
 */
export const ONTARIO_ADVICE = {
  headline: "Ontario moved to take the bike lanes out",
  lede:
    "After Toronto put them in, the province said it would put car lanes back on busy streets, including this one. Ministry staff and a consultant (CIMA+) wrote advice on what that would do. The crash figures below are from that advice, later reported by CBC.",
  callouts: [
    {
      tone: "amber" as const,
      stat: "Traffic",
      text: "The same advice said putting car lanes back might ease congestion only a little, or only for a while",
    },
  ],
  /** One line under the crash visual; not a second court timeline. */
  afterNote:
    "In 2025, the Superior Court noted the province already had this advice when it moved ahead.",
  bullets: [] as string[],
  links: [LINKS.cbcInternal, LINKS.onsc2025, LINKS.ontarioNewsroom],
} as const;

export const METRIC_SOURCES = {
  ksi: [LINKS.ksi],
  speed: [LINKS.fall2026],
  travel: [LINKS.fall2026, LINKS.congestionPlan2026],
  cyclists: [LINKS.fall2026, LINKS.bikeCounters],
} as const;

export const CHART_SOURCES = {
  speed: [LINKS.fall2026],
  cycling: [LINKS.fall2026],
  counter: [LINKS.bikeCounters],
  travel: [LINKS.fall2026, LINKS.congestionPlan2026],
} as const;

export const META = {
  corridorKm: 4.7,
  phase1: "Fall 2023, Runnymede to Aberfoyle",
  phase2: "2024, Aberfoyle to Resurrection",
  beforeYears: "2016 to 2022",
  afterYears: "2024 to 2026",
  sources: [
    LINKS.fall2026,
    LINKS.projectPage,
    LINKS.councilIE43,
    LINKS.congestionPlan,
    LINKS.congestionPlan2026,
    LINKS.ksi,
    LINKS.tpsCollisions,
    LINKS.orsar2024,
    LINKS.bikeCounters,
    LINKS.cbcInternal,
    LINKS.onsc2025,
    LINKS.cbcAppeal,
    LINKS.ontarioNewsroom,
  ],
} as const;
