import { useMemo, useState } from "react";
import { CorridorMap } from "./components/CorridorMap";
import { IntroHook } from "./components/IntroHook";
import { OntarioHook } from "./components/OntarioHook";
import { ReportedHook } from "./components/ReportedHook";
import { CalloutList } from "./components/Callout";
import { ShareBar } from "./components/ShareBar";
import {
  CHART_SOURCES,
  CITY_FINDINGS,
  COUNCIL_VOTE,
  CYCLING,
  LINKS,
  META,
  METRIC_SOURCES,
  ONTARIO_ADVICE,
  SPEED,
  TRAVEL_TIME,
  avgP95Speed,
  avgSpeed,
  cyclistsPerYearApprox,
  ksiPerYear,
  ksiTotal,
  ksiYears,
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
  const onMap = step === STEPS.length - 1;

  const go = (next: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
    if (next < STEPS.length - 1) setChartsOpen(false);
  };

  const metrics = useMemo(() => {
    const ksiBefore = ksiPerYear("before");
    const ksiAfter = ksiPerYear("after");
    const travelBefore = travelMinutes("before");
    const travelAfter = travelMinutes("after");
    const bikeBefore = totalCyclists("before");
    const bikeAfter = totalCyclists("after");
    const travelMinsAdded = travelAfter - travelBefore;

    return {
      speed: avgSpeed(period),
      p95: avgP95Speed(period),
      ksiBefore,
      ksiAfter,
      travelBefore,
      travelAfter,
      bikeBefore,
      bikeAfter,
      ksiDelta: pctChange(ksiBefore, ksiAfter),
      travelDelta: pctChange(travelBefore, travelAfter),
      cyclistsDelta: pctChange(bikeBefore, bikeAfter),
      travelMinsAdded,
      travelMinsLabel:
        travelMinsAdded >= 0
          ? `+${travelMinsAdded.toFixed(1)} min`
          : `${travelMinsAdded.toFixed(1)} min`,
    };
  }, [period]);

  const speedMax = Math.max(...SPEED.p95.before, ...SPEED.p95.after);
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
            <p className="eyebrow">Toronto</p>
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
                <div className="intro-copy">
                  <h1>Bike lanes on Bloor Street West</h1>
                  <p className="story-lede">
                    In 2023 and 2024, Toronto put barrier-separated bike lanes on
                    Bloor Street West. Next: Ontario&apos;s own files on taking
                    them out, then the City&apos;s before and after numbers, then
                    a map.
                  </p>
                </div>
                <IntroHook />
              </section>
            ) : null}

            {step === 1 ? (
              <section className="story-panel advice">
                <p className="step-kicker">2 of 4 · Ontario</p>
                <h1>{ONTARIO_ADVICE.headline}</h1>
                <p className="story-lede">{ONTARIO_ADVICE.lede}</p>
                <OntarioHook />
                <CalloutList items={ONTARIO_ADVICE.callouts} />
                <p className="advice-after-note">{ONTARIO_ADVICE.afterNote}</p>
                <p className="advice-cites">
                  <CiteLinks links={ONTARIO_ADVICE.links} prefix="Sources" />
                </p>
              </section>
            ) : null}

            {step === 2 ? (
              <section className="story-panel reported">
                <p className="step-kicker">3 of 4 · City numbers</p>
                <h1>City measurements on this stretch</h1>
                <p className="story-lede">
                  Before means {META.beforeYears}. After means {META.afterYears},
                  once both build phases were done.
                </p>
                <aside className="city-findings">
                  <p className="city-findings-title">{CITY_FINDINGS.title}</p>
                  <ul>
                    {CITY_FINDINGS.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <p className="city-findings-cite">
                    <CiteLinks links={[LINKS.fall2026]} />
                  </p>
                </aside>
                <ReportedHook
                  crashBefore={ksiPerYear("before")}
                  crashAfter={ksiPerYear("after")}
                  crashDelta={pctChange(
                    ksiPerYear("before"),
                    ksiPerYear("after"),
                  )}
                  crashTotalBefore={ksiTotal("before")}
                  crashTotalAfter={ksiTotal("after")}
                  crashYearsBefore={ksiYears("before")}
                  crashYearsAfter={ksiYears("after")}
                  bikeBefore={totalCyclists("before")}
                  bikeAfter={totalCyclists("after")}
                  bikeDelta={pctChange(
                    totalCyclists("before"),
                    totalCyclists("after"),
                  )}
                  bikeYearBefore={cyclistsPerYearApprox("before")}
                  bikeYearAfter={cyclistsPerYearApprox("after")}
                  travelBefore={travelMinutes("before")}
                  travelAfter={travelMinutes("after")}
                  crashLinks={METRIC_SOURCES.ksi}
                  speedLinks={METRIC_SOURCES.speed}
                  bikeLinks={METRIC_SOURCES.cyclists}
                  travelLinks={METRIC_SOURCES.travel}
                />
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
              {step === 0 ? "Next" : step === 1 ? "City numbers" : "See the map"}
            </button>
          </footer>
        </div>
      ) : (
        <div className="hud">
          <div className="top-bar">
            <div className="brand compact">
              <p className="eyebrow">4 of 4 · Map</p>
              <h1>Bike lanes on Bloor Street West</h1>
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
              <div className="legend-row">
                <span className="dot lane" /> Corridor
              </div>
              <div className="legend-row">
                <span className="dot crash-fatal" /> Died
              </div>
              <div className="legend-row">
                <span className="dot crash-major" /> Badly hurt
              </div>
              <div className="legend-row">
                <span className="dot crash-cyclist" /> Cyclist hurt
              </div>
              <div className="legend-row">
                <span className="dot counter" /> Counter
              </div>
              <div className="legend-row">
                {metrics.p95.toFixed(0)} km/h 95th
              </div>
            </div>

            <div className="metrics" aria-live="polite">
              <div className="metric" data-tone="crash">
                <div className="label">Serious crashes / year</div>
                <div className="compare" data-period={period}>
                  <span className="compare-num" data-side="before">
                    {metrics.ksiBefore.toFixed(1)}
                  </span>
                  <span className="compare-arrow" aria-hidden>
                    →
                  </span>
                  <span className="compare-num" data-side="after">
                    {metrics.ksiAfter.toFixed(1)}
                  </span>
                </div>
                <p className="impact">
                  <strong>{metrics.ksiDelta}</strong> once the lanes were in
                </p>
              </div>
              <div className="metric" data-tone="amber">
                <div className="label">Afternoon drive · 4 to 7 pm</div>
                <div className="compare" data-period={period}>
                  <span className="compare-num" data-side="before">
                    {metrics.travelBefore.toFixed(1)}
                    <span className="compare-unit">min</span>
                  </span>
                  <span className="compare-arrow" aria-hidden>
                    →
                  </span>
                  <span className="compare-num" data-side="after">
                    {metrics.travelAfter.toFixed(1)}
                    <span className="compare-unit">min</span>
                  </span>
                </div>
                <p className="impact">
                  <strong>{metrics.travelMinsLabel}</strong> ({metrics.travelDelta})
                </p>
              </div>
              <div className="metric" data-tone="bike">
                <div className="label">People on bikes / day</div>
                <div className="compare" data-period={period}>
                  <span className="compare-num" data-side="before">
                    {Math.round(metrics.bikeBefore).toLocaleString()}
                  </span>
                  <span className="compare-arrow" aria-hidden>
                    →
                  </span>
                  <span className="compare-num" data-side="after">
                    {Math.round(metrics.bikeAfter).toLocaleString()}
                  </span>
                </div>
                <p className="impact">
                  <strong>{metrics.cyclistsDelta}</strong> once the lanes were in
                </p>
              </div>
            </div>

            <div className="toggle-wrap">
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
                  onClick={() => setPeriod("before")}
                >
                  <span className="when">Before</span>
                  <span className="years">{META.beforeYears}</span>
                </button>
                <div className="toggle-mid" aria-hidden />
                <button
                  type="button"
                  className="toggle-btn"
                  data-active={period === "after"}
                  onClick={() => setPeriod("after")}
                >
                  <span className="when">After</span>
                  <span className="years">{META.afterYears}</span>
                </button>
              </div>
            </div>

            <ShareBar />
          </div>
        </div>
      )}

      {chartsOpen && onMap ? (
        <aside className="charts-panel" aria-label="Charts">
          <div>
            <h2>95th percentile speed (km/h)</h2>
            <p className="chart-cite">
              <CiteLinks links={CHART_SOURCES.speed} />
              {" · "}posted {SPEED.postedLimitKmh} km/h
            </p>
            <div className="bars">
              {SPEED.sites.map((site, i) => {
                const v = SPEED.p95[period][i] ?? 0;
                return (
                  <div className="bar-row" key={site}>
                    <div className="name">{site}</div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(v / speedMax) * 100}%` }}
                      />
                      <div
                        className="bar-limit"
                        style={{
                          left: `${(SPEED.postedLimitKmh / speedMax) * 100}%`,
                        }}
                        title={`Posted ${SPEED.postedLimitKmh} km/h`}
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
            <h2>Drive time · weekday afternoon, 4 to 7 pm</h2>
            <p className="chart-cite">
              <CiteLinks links={CHART_SOURCES.travel} />
            </p>
            <p className="chart-note">
              After install: afternoon +{TRAVEL_TIME.changeByTimeOfDay.afternoonPeak.low}–
              {TRAVEL_TIME.changeByTimeOfDay.afternoonPeak.high} min · other times +
              {TRAVEL_TIME.changeByTimeOfDay.offPeak.low}–
              {TRAVEL_TIME.changeByTimeOfDay.offPeak.high} min.{" "}
              {TRAVEL_TIME.citywide.shortHud}.
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
            <h2 id="sources-title">Sources</h2>
            <p className="sources-lede">
              Before is {META.beforeYears}. After is {META.afterYears}. Phase 1:{" "}
              {META.phase1}. Phase 2: {META.phase2}. About the lanes going in,
              not the provincial teardown that started in October 2026.
            </p>

            <section className="sources-vote">
              <h3>Who voted on the Bloor lanes</h3>
              <p>
                {COUNCIL_VOTE.summary} Recorded votes from{" "}
                <a
                  href={LINKS.councilIE43.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {COUNCIL_VOTE.item}
                </a>
                , {COUNCIL_VOTE.date}.
              </p>

              <h4>{COUNCIL_VOTE.stripBloor.label}</h4>
              <p className="sources-vote-result">
                {COUNCIL_VOTE.stripBloor.result}
              </p>
              <p>
                <strong>Yes</strong> ({COUNCIL_VOTE.stripBloor.yesMeans}):{" "}
                {COUNCIL_VOTE.stripBloor.yes.join(", ")}
              </p>
              <p>
                <strong>No</strong> ({COUNCIL_VOTE.stripBloor.noMeans}):{" "}
                {COUNCIL_VOTE.stripBloor.no.join(", ")}
              </p>
              <p>
                <strong>Absent:</strong>{" "}
                {COUNCIL_VOTE.stripBloor.absent.join(", ")}
              </p>

              <h4>{COUNCIL_VOTE.adopt.label}</h4>
              <p className="sources-vote-result">
                {COUNCIL_VOTE.adopt.result}
              </p>
              <p>
                <strong>Yes:</strong> {COUNCIL_VOTE.adopt.yes.join(", ")}
              </p>
              <p>
                <strong>No:</strong> {COUNCIL_VOTE.adopt.no.join(", ")}
              </p>
              <p>
                <strong>Absent:</strong> {COUNCIL_VOTE.adopt.absent.join(", ")}
              </p>
            </section>

            <ul className="sources-list">
              {META.sources.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
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
