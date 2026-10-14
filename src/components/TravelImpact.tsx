import { TRAVEL_TIME } from "../data/corridor";

type Props = {
  beforeMin: number;
  afterMin: number;
};

/** Shared scale so a few extra minutes read as a thin slice, not a big % card. */
const SCALE_MAX = 20;

function bothDirAvg(west: number, east: number): number {
  return (west + east) / 2;
}

/**
 * City Fall 2026 end-to-end drive times on a quiet absolute scale,
 * plus the report’s rise-then-ease arc and citywide TTI context.
 */
export function TravelImpact({ beforeMin, afterMin }: Props) {
  const delta = afterMin - beforeMin;
  const peakMin = bothDirAvg(
    TRAVEL_TIME.peakYear.west,
    TRAVEL_TIME.peakYear.east,
  );
  const beforePct = Math.min(100, (beforeMin / SCALE_MAX) * 100);
  const peakPct = Math.min(100, (peakMin / SCALE_MAX) * 100);
  const afterPct = Math.min(100, (afterMin / SCALE_MAX) * 100);
  const off = TRAVEL_TIME.changeByTimeOfDay.offPeak;
  const peak = TRAVEL_TIME.changeByTimeOfDay.afternoonPeak;
  const cw = TRAVEL_TIME.citywide;
  const easeFromPeak = peakMin - afterMin;

  return (
    <div className="travel-impact">
      <p className="travel-impact-lede">
        Weekday afternoon, 4 to 7 pm, Runnymede to Resurrection. Times rose
        through 2025 with city-wide congestion, then came down on this stretch
        into 2026.
      </p>

      <div className="trip-scale" aria-hidden>
        <div className="trip-row">
          <span className="trip-year">2022</span>
          <div className="trip-track">
            <div className="trip-fill" style={{ width: `${beforePct}%` }} />
          </div>
          <span className="trip-min">{beforeMin.toFixed(1)} min</span>
        </div>
        <div className="trip-row">
          <span className="trip-year">2025</span>
          <div className="trip-track">
            <div className="trip-fill" style={{ width: `${peakPct}%` }} />
          </div>
          <span className="trip-min">{peakMin.toFixed(1)} min</span>
        </div>
        <div className="trip-row">
          <span className="trip-year">2026</span>
          <div className="trip-track">
            <div className="trip-fill" style={{ width: `${afterPct}%` }} />
          </div>
          <span className="trip-min">{afterMin.toFixed(1)} min</span>
        </div>
        <div className="trip-ruler">
          <span>0</span>
          <span>10</span>
          <span>{SCALE_MAX} min</span>
        </div>
      </div>

      <p className="trip-delta">
        Still about <strong>{delta.toFixed(1)} minutes</strong> more than 2022 —
        but{" "}
        <strong>
          {easeFromPeak >= 0.05
            ? `${easeFromPeak.toFixed(1)} min less than 2025`
            : "no longer climbing past 2025"}
        </strong>
        .
      </p>

      <div className="trip-hours">
        <p>
          <span className="trip-hours-label">Other hours</span>
          <span className="trip-hours-val">
            +{off.low} to {off.high} min
          </span>
        </p>
        <p>
          <span className="trip-hours-label">4 to 7 pm</span>
          <span className="trip-hours-val">
            +{peak.low} to {peak.high} min
          </span>
        </p>
      </div>

      <aside className="trip-citywide">
        <p className="trip-citywide-title">Citywide context (different metric)</p>
        <p className="trip-citywide-stat">
          Afternoon Travel Time Index:{" "}
          <strong>{cw.tti["2024"].toFixed(2)}</strong> in 2024 →{" "}
          <strong>{cw.tti["2025"].toFixed(2)}</strong> in 2025 (
          {cw.ttiChangePct}%). Downtown: {cw.downtownTti["2024"].toFixed(2)} →{" "}
          {cw.downtownTti["2025"].toFixed(2)} ({cw.downtownChangePct}%).
        </p>
        <p className="trip-citywide-note">{cw.note}</p>
      </aside>
    </div>
  );
}
