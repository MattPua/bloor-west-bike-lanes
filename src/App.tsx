import { useMemo, useState } from "react";
import { CorridorMap } from "./components/CorridorMap";
import { AnimatedNumber } from "./components/AnimatedNumber";
import {
  CYCLING,
  META,
  SPEED,
  TRAVEL_TIME,
  avgSpeed,
  ksiPerYear,
  pointsForPeriod,
  totalCyclists,
  travelMinutes,
  type Period,
} from "./data/corridor";

function pctChange(before: number, after: number): string {
  const pct = ((after - before) / before) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

export default function App() {
  const [period, setPeriod] = useState<Period>("before");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false);

  const metrics = useMemo(() => {
    const ksi = ksiPerYear(period);
    const travel = travelMinutes(period);
    const cyclists = totalCyclists(period);
    const speed = avgSpeed(period);
    const crashes = pointsForPeriod(period).length;

    return {
      ksi,
      travel,
      cyclists,
      speed,
      crashes,
      ksiDelta: pctChange(ksiPerYear("before"), ksiPerYear("after")),
      travelDelta: pctChange(travelMinutes("before"), travelMinutes("after")),
      cyclistsDelta: pctChange(totalCyclists("before"), totalCyclists("after")),
    };
  }, [period]);

  const speedMax = Math.max(...SPEED.before, ...SPEED.after);
  const cycleMax = Math.max(...CYCLING.before, ...CYCLING.after);
  const travelMax =
    Math.max(
      TRAVEL_TIME.before.west,
      TRAVEL_TIME.before.east,
      TRAVEL_TIME.after.west,
      TRAVEL_TIME.after.east,
    ) * 1.15;

  return (
    <div className="app">
      <CorridorMap period={period} />

      <div className="hud">
        <div className="top-bar">
          <div className="brand">
            <h1>Bloor West bike lanes</h1>
            <p>
              Serious crashes, travel time, and cycling — before vs after
              protected lanes were added on Toronto’s 4.7 km Complete Street.
            </p>
            <div className="period-chip">
              Viewing {period === "before" ? META.beforeYears : META.afterYears}
            </div>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className="charts-btn"
              data-active={chartsOpen}
              onClick={() => setChartsOpen((v) => !v)}
            >
              {chartsOpen ? "Hide charts" : "Charts"}
            </button>
            <button
              type="button"
              className="sources-btn"
              onClick={() => setSourcesOpen(true)}
            >
              Sources
            </button>
          </div>
        </div>

        <div className="bottom-stack">
          <div className="metrics" aria-live="polite">
            <div className="metric" data-tone="crash">
              <div className="label">Serious collisions / year</div>
              <div className="value">
                <AnimatedNumber value={metrics.ksi} decimals={1} />
              </div>
              <div className="delta">
                After vs before <strong>{metrics.ksiDelta}</strong> ·{" "}
                {metrics.crashes} on map
              </div>
            </div>
            <div className="metric" data-tone="amber">
              <div className="label">PM peak end-to-end</div>
              <div className="value">
                <AnimatedNumber value={metrics.travel} decimals={1} />
                <span style={{ fontSize: "0.45em", marginLeft: 4 }}>min</span>
              </div>
              <div className="delta">
                After vs before <strong>{metrics.travelDelta}</strong>
              </div>
            </div>
            <div className="metric" data-tone="bike">
              <div className="label">People cycling / day</div>
              <div className="value">
                <AnimatedNumber value={metrics.cyclists} decimals={0} />
              </div>
              <div className="delta">
                After vs before <strong>{metrics.cyclistsDelta}</strong>
              </div>
            </div>
          </div>

          <div
            className="toggle"
            role="group"
            aria-label="Compare before and after bike lanes"
          >
            <div className="toggle-knob" data-period={period} />
            <button
              type="button"
              className="toggle-btn"
              data-active={period === "before"}
              onClick={() => setPeriod("before")}
            >
              <span className="when">Before lanes</span>
              <span className="years">{META.beforeYears}</span>
            </button>
            <div className="toggle-mid" aria-hidden />
            <button
              type="button"
              className="toggle-btn"
              data-active={period === "after"}
              onClick={() => setPeriod("after")}
            >
              <span className="when">After lanes</span>
              <span className="years">{META.afterYears}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="legend" aria-hidden>
        <div className="legend-row">
          <span className="dot lane" /> Protected bike corridor
        </div>
        <div className="legend-row">
          <span className="dot" /> Serious / fatal collision
        </div>
        <div className="legend-row">
          Avg speed {metrics.speed.toFixed(0)} km/h
        </div>
      </div>

      {chartsOpen ? (
        <aside className="charts-panel" aria-label="Detail charts">
          <div>
            <h2>Vehicle speed · km/h</h2>
            <div className="bars">
              {SPEED.sites.map((site, i) => {
                const v = SPEED[period][i] ?? 0;
                return (
                  <div className="bar-row" key={site}>
                    <div className="name">{site}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(v / speedMax) * 100}%` }}
                      />
                    </div>
                    <div className="num">{v.toFixed(0)}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h2>People cycling / day</h2>
            <div className="bars">
              {CYCLING.sites.map((site, i) => {
                const v = CYCLING[period][i] ?? 0;
                return (
                  <div className="bar-row" key={site}>
                    <div className="name">{site}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(v / cycleMax) * 100}%` }}
                      />
                    </div>
                    <div className="num">{v}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <h2>Travel time · before | after</h2>
            <div className="spark">
              <div className="spark-col">
                <div className="tag">Westbound</div>
                <div className="spark-bars">
                  <span
                    data-active={period === "before"}
                    style={{
                      height: `${(TRAVEL_TIME.before.west / travelMax) * 100}%`,
                    }}
                  />
                  <span
                    data-active={period === "after"}
                    style={{
                      height: `${(TRAVEL_TIME.after.west / travelMax) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="spark-col">
                <div className="tag">Eastbound</div>
                <div className="spark-bars">
                  <span
                    data-active={period === "before"}
                    style={{
                      height: `${(TRAVEL_TIME.before.east / travelMax) * 100}%`,
                    }}
                  />
                  <span
                    data-active={period === "after"}
                    style={{
                      height: `${(TRAVEL_TIME.after.east / travelMax) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
      ) : null}

      {sourcesOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSourcesOpen(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sources-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="sources-title">Sources & notes</h2>
            <ul>
              {META.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
              <li>
                Before = no protected Complete Street lanes. After = 2024–2026
                once Phase 2 was in.
              </li>
              <li>
                Phase 1 {META.phase1}. Phase 2 {META.phase2}.
              </li>
              <li>
                This compares the addition of lanes — not the 2026 provincial
                removal.
              </li>
            </ul>
            <button
              type="button"
              className="close"
              onClick={() => setSourcesOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
