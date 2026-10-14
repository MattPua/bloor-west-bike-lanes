import raw from "./bike-counter.json";

export type BikeCounterMonth = {
  month: string;
  total: number;
  avgDay: number;
};

export type BikeCounterData = {
  site: string;
  lon: number;
  lat: number;
  firstActive: string;
  note: string;
  summerAvgPerDay: { "2025": number; "2026": number };
  summerTotal: { "2025": number; "2026": number };
  summerAvgGrowthPct: number;
  monthly: BikeCounterMonth[];
};

export const BIKE_COUNTER = raw as BikeCounterData;

/** Months with enough days to chart (skip install stubs). */
export function bikeCounterChartMonths(): BikeCounterMonth[] {
  return BIKE_COUNTER.monthly.filter((m) => m.avgDay >= 30 && m.total >= 2000);
}

export function bikeCounterGeoJson(): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          label: "Permanent bike counter",
          site: BIKE_COUNTER.site,
        },
        geometry: {
          type: "Point",
          coordinates: [BIKE_COUNTER.lon, BIKE_COUNTER.lat],
        },
      },
    ],
  };
}
