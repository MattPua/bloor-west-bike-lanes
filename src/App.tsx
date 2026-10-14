import { useMemo, useState } from "react";
import { CorridorMap } from "./components/CorridorMap";
import { AnimatedNumber } from "./components/AnimatedNumber";
import {
  CHART_SOURCES,
  CYCLING,
  LINKS,
  META,
  METRIC_SOURCES,
  ONTARIO_ADVICE,
  SPEED,
  TRAVEL_TIME,
  avgSpeed,
  ksiPerYear,
  pointsForPeriod,
  totalCyclists,
  travelMinutes,
  type Cite,
  type Period,
} from "./data/corridor";
import {
  BIKE_COUNTER,
  bikeCounterChartMonths,
} from "./data/bike-counter";

const STEPS = [
  { id: "intro", label: "Intro" },
  { id: "ontario", label: "Documents" },
  { id: "reported", label: "Numbers" },
  { id: "map", label: "Map" },
] as const;

function pctChange(before: number, after: number): string {
  const pct = ((after - before) / before) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(0)}%`;
}

function CiteLinks({
  links,
  prefix = "Source",
}: {
  links: readonly Cite[];
  prefix?: string;
}) {
  return (
    <span className="cite-links">
      {prefix ? `${prefix}: ` : null}
      {links.map((link, i) => (
        <span key={link.href}>
          {i > 0 ? " · " : null}
          <a href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        </span>
      ))}
    </span>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState<Period>("before");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [chartsOpen, setChartsOpen] = useState(false);
  const [flippedOnce, setFlippedOnce] = useState(false);

  const onMap = step === STEPS.length - 1;

  const selectPeriod = (next: Period) => {
    if (next !== period) setFlippedOnce(true);
    setPeriod(next);
  };

  const go = (next: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
    if (next < STEPS.length - 1) setChartsOpen(false);
  };

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

  const reportCards = useMemo(
    () => [
      {
        tone: "crash" as const,
        label: "Serious crashes / year",
        before: ksiPerYear("before"),
        after: ksiPerYear("after"),
        decimals: 1,
        unit: "",
        delta: pctChange(ksiPerYear("before"), ksiPerYear("after")),
        bullets: [
          "People killed or seriously hurt on this stretch",
          "Toronto Open Data KSI, annualized",
        ],
        links: METRIC_SOURCES.ksi,
      },
      {
        tone: "amber" as const,
        label: "Afternoon drive, end to end",
        before: travelMinutes("before"),
        after: travelMinutes("after"),
        decimals: 1,
        unit: "min",
        delta: pctChange(travelMinutes("before"), travelMinutes("after")),
        bullets: [
          "Weekday PM peak, Resurrection to Runnymede",
          "Rose through 2025, lower in 2026 on this stretch",
          "City compares the rise to citywide congestion",
        ],
        links: METRIC_SOURCES.travel,
      },
      {
        tone: "bike" as const,
        label: "People on bikes / day",
        before: totalCyclists("before"),
        after: totalCyclists("after"),
        decimals: 0,
        unit: "",
        delta: pctChange(totalCyclists("before"), totalCyclists("after")),
        bullets: [
          "City spot counts at four sites on the corridor",
          `Old Mill permanent counter +${BIKE_COUNTER.summerAvgGrowthPct}% May to August, 2025 to 2026`,
        ],
        links: METRIC_SOURCES.cyclists,
      },
    ],
    [],
  );

  const speedMax = Math.max(...SPEED.before, ...SPEED.after);
  const cycleMax = Math.max(...CYCLING.before, ...CYCLING.after);
  const counterMonths = bikeCounterChartMonths();
  const counterMax = Math.max(...counterMonths.map((m) => m.avgDay), 1);
  const travelMax =
    Math.max(
      TRAVEL_TIME.before.west,
      TRAVEL_TIME.before.east,
      TRAVEL_TIME.after.west,
      TRAVEL_TIME.after.east,
    ) * 1.15;

  return (
    <div className="app" data-step={STEPS[step].id}>
      {onMap ? <CorridorMap period={period} /> : <div className="story-bg" aria-hidden />}

      {!onMap ? (
        <div className="story">
          <header className="story-top">
            <p className="eyebrow">Toronto · Bloor West</p>
            <div className="step-dots" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className="step-dot"
                  data-active={i === step}
                  data-done={i < step}
                  aria-label={`${s.label}${i === step ? ", current" : ""}`}
                  onClick={() => go(i)}
                />
              ))}
            </div>
          </header>

          <main className="story-main" key={STEPS[step].id}>
            {step === 0 ? (
              <section className="story-panel intro">
                <h1>Bloor West bike lanes</h1>
                <p className="story-lede">
                  In 2023 and 2024, Toronto installed protected bike lanes on
                  4.7 km of Bloor Street West, from Runnymede to Resurrection.
                </p>
                <ul className="lede-bullets">
                  <li>What the province's documents said about removing them</li>
                  <li>What City monitoring reported afterward</li>
                  <li>A map of the stretch you can flip before and after</li>
                </ul>
              </section>
            ) : null}

            {step === 1 ? (
              <section className="story-panel advice">
                <p className="step-kicker">2 of 4 · The paper trail</p>
                <h1>{ONTARIO_ADVICE.headline}</h1>
                <ul className="advice-bullets">
                  {ONTARIO_ADVICE.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <p className="advice-cites">
                  <CiteLinks links={ONTARIO_ADVICE.links} prefix="Sources" />
                </p>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="story-panel reported">
                <p className="step-kicker">3 of 4 · What was measured</p>
                <h1>Before and after on this stretch</h1>
                <ul className="lede-bullets">
                  <li>Before: 2016 to 2022</li>
                  <li>After: 2024 to 2026, once Phase 2 was in</li>
                  <li>Figures from City reports and open data</li>
                </ul>
                <div className="report-grid">
                  {reportCards.map((card) => (
                    <article
                      key={card.label}
                      className="report-card"
                      data-tone={card.tone}
                    >
                      <div className="label">{card.label}</div>
                      <div className="report-compare">
                        <div>
                          <span className="tag">Before</span>
                          <strong>
                            {card.before.toFixed(card.decimals)}
                            {card.unit ? ` ${card.unit}` : ""}
                          </strong>
                        </div>
                        <span className="arrow" aria-hidden>
                          →
                        </span>
                        <div>
                          <span className="tag">After</span>
                          <strong>
                            {card.after.toFixed(card.decimals)}
                            {card.unit ? ` ${card.unit}` : ""}
                          </strong>
                        </div>
                        <span className="delta">{card.delta}</span>
                      </div>
                      <ul className="card-bullets">
                        {card.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                      <CiteLinks links={card.links} />
                    </article>
                  ))}
                </div>
                <div className="report-extras">
                  {META.context.slice(0, 4).map((c) => (
                    <article key={c.headline} className="context-item">
                      <h4>{c.headline}</h4>
                      <ul className="card-bullets">
                        {c.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                      <CiteLinks links={c.links} prefix="" />
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </main>

          <footer className="story-nav">
            {step > 0 ? (
              <button type="button" className="nav-btn ghost" onClick={() => go(step - 1)}>
                Back
              </button>
            ) : (
              <span />
            )}
            <button type="button" className="nav-btn primary" onClick={() => go(step + 1)}>
              {step === 0
                ? "Next"
                : step === 1
                  ? "What was measured"
                  : "Open the map"}
            </button>
          </footer>
        </div>
      ) : (
        <div className="hud">
          <div className="top-bar">
            <div className="brand compact">
              <p className="eyebrow">4 of 4 · Map</p>
              <h1>Bloor West bike lanes</h1>
              <div className="period-chip" data-period={period}>
                {period === "before"
                  ? `Showing ${META.beforeYears}`
                  : `Showing ${META.afterYears}`}
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
              <button
                type="button"
                className="sources-btn"
                onClick={() => go(2)}
              >
                Back
              </button>
            </div>
          </div>

          <div className="bottom-stack">
            <div className="legend" aria-hidden>
              <div className="legend-row legend-label">On the map</div>
              <div className="legend-row">
                <span className="dot lane" style={{ opacity: 0.45 }} /> Other bike
                lanes
              </div>
              <div className="legend-row">
                <span className="dot lane" /> Bloor West
              </div>
              <div className="legend-row">
                <span className="dot" /> Serious crashes (tap)
              </div>
              <div className="legend-row">
                <span className="dot counter" /> Bike counter (tap)
              </div>
              <div className="legend-row">
                Avg {metrics.speed.toFixed(0)} km/h
              </div>
            </div>

            <div className="metrics" aria-live="polite">
              <div className="metric" data-tone="crash">
                <div className="label">Serious crashes / year</div>
                <div className="value">
                  <AnimatedNumber value={metrics.ksi} decimals={1} />
                </div>
                <div className="delta">
                  Change: <strong>{metrics.ksiDelta}</strong>
                </div>
              </div>
              <div className="metric" data-tone="amber">
                <div className="label">Afternoon drive</div>
                <div className="value">
                  <AnimatedNumber value={metrics.travel} decimals={1} />
                  <span style={{ fontSize: "0.45em", marginLeft: 4 }}>min</span>
                </div>
                <div className="delta">
                  Change: <strong>{metrics.travelDelta}</strong>
                </div>
              </div>
              <div className="metric" data-tone="bike">
                <div className="label">People on bikes / day</div>
                <div className="value">
                  <AnimatedNumber value={metrics.cyclists} decimals={0} />
                </div>
                <div className="delta">
                  Change: <strong>{metrics.cyclistsDelta}</strong>
                </div>
              </div>
            </div>

            <div className="toggle-wrap">
              <p className="toggle-hint" data-done={flippedOnce}>
                {flippedOnce
                  ? "Map and numbers match the years you pick."
                  : "Switch years to compare before and after."}
              </p>
              <div
                className="toggle"
                role="group"
                aria-label="Before or after the Bloor West bike lanes"
              >
                <div className="toggle-knob" data-period={period} />
                <button
                  type="button"
                  className="toggle-btn"
                  data-active={period === "before"}
                  onClick={() => selectPeriod("before")}
                >
                  <span className="when">Before</span>
                  <span className="years">{META.beforeYears}</span>
                </button>
                <div className="toggle-mid" aria-hidden />
                <button
                  type="button"
                  className="toggle-btn"
                  data-active={period === "after"}
                  onClick={() => selectPeriod("after")}
                >
                  <span className="when">After</span>
                  <span className="years">{META.afterYears}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {chartsOpen && onMap ? (
        <aside className="charts-panel" aria-label="Charts">
          <div>
            <h2>Car speed (km/h)</h2>
            <p className="chart-cite">
              <CiteLinks links={CHART_SOURCES.speed} />
            </p>
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
            <h2>People on bikes per day</h2>
            <p className="chart-cite">
              <CiteLinks links={CHART_SOURCES.cycling} />
            </p>
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
            <h2>Permanent counter · Old Mill</h2>
            <p className="chart-cite">
              <CiteLinks links={CHART_SOURCES.counter} />
            </p>
            <div className="spark" style={{ marginBottom: 10 }}>
              <div className="spark-col">
                <div className="tag">May to Aug 2025</div>
                <div className="spark-bars">
                  <span
                    data-active
                    style={{
                      height: `${(BIKE_COUNTER.summerAvgPerDay["2025"] / counterMax) * 100}%`,
                    }}
                  />
                </div>
                <div className="tag">
                  {BIKE_COUNTER.summerAvgPerDay["2025"].toFixed(0)}/day
                </div>
              </div>
              <div className="spark-col">
                <div className="tag">May to Aug 2026</div>
                <div className="spark-bars">
                  <span
                    data-active
                    style={{
                      height: `${(BIKE_COUNTER.summerAvgPerDay["2026"] / counterMax) * 100}%`,
                    }}
                  />
                </div>
                <div className="tag">
                  {BIKE_COUNTER.summerAvgPerDay["2026"].toFixed(0)}/day (+
                  {BIKE_COUNTER.summerAvgGrowthPct}%)
                </div>
              </div>
            </div>
            <p className="chart-note">{BIKE_COUNTER.note}</p>
          </div>
          <div>
            <h2>Drive time (left = before, right = after)</h2>
            <p className="chart-cite">
              <CiteLinks links={CHART_SOURCES.travel} />
            </p>
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
            <h2 id="sources-title">Where the numbers come from</h2>
            <ul>
              {META.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                "No protected lanes" is 2016 to 2022. "Lanes in" is 2024 to
                2026, after Phase 2 finished.
              </li>
              <li>
                Built in two chunks: {META.phase1}. Then {META.phase2}.{" "}
                <CiteLinks links={[LINKS.projectPage]} prefix="See" />
              </li>
              <li>
                This is about the lanes going in. Not the provincial teardown
                that started in October 2026.{" "}
                <CiteLinks links={[LINKS.ontarioNewsroom]} prefix="See" />
              </li>
            </ul>

            <h3 className="context-title">More from the public record</h3>
            <p className="context-lede">
              Tap a source for the original document or page.
            </p>
            <div className="context-grid">
              {META.context.map((c) => (
                <article key={c.headline} className="context-item">
                  <h4>{c.headline}</h4>
                  <ul className="card-bullets">
                    {c.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <CiteLinks links={c.links} prefix="" />
                </article>
              ))}
            </div>
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
