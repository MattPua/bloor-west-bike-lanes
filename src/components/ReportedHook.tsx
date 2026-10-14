import { CalloutList } from "./Callout";
import { TravelImpact } from "./TravelImpact";
import {
  SPEED,
  avgP95Speed,
  avgSpeed,
  formatApproxTrips,
  ksiProjectedAtBeforeRate,
  maxP95Drop,
  type Cite,
} from "../data/corridor";

type Props = {
  crashBefore: number;
  crashAfter: number;
  crashDelta: string;
  crashTotalBefore: number;
  crashTotalAfter: number;
  crashYearsBefore: number;
  crashYearsAfter: number;
  bikeBefore: number;
  bikeAfter: number;
  bikeDelta: string;
  bikeYearBefore: number;
  bikeYearAfter: number;
  travelBefore: number;
  travelAfter: number;
  crashLinks: readonly Cite[];
  speedLinks: readonly Cite[];
  bikeLinks: readonly Cite[];
  travelLinks: readonly Cite[];
};

function BeatCite({ links }: { links: readonly Cite[] }) {
  return (
    <p className="beat-cite">
      <span className="cite-links">
        Source:{" "}
        {links.map((link, i) => (
          <span key={link.href}>
            {i > 0 ? " · " : null}
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </span>
        ))}
      </span>
    </p>
  );
}

/** Shared-scale bar: `share` is 0–1 of the larger value. */
function ScaleBar({
  share,
  tone,
  delay = 0,
}: {
  share: number;
  tone:
    | "crash-before"
    | "crash-after"
    | "speed-before"
    | "speed-after"
    | "bike-before"
    | "bike-after";
  delay?: number;
}) {
  const pct = Math.max(4, Math.min(100, share * 100));
  return (
    <div className="scale-track" aria-hidden>
      <div
        className="scale-fill"
        data-tone={tone}
        style={{
          ["--w" as string]: `${pct}%`,
          ["--delay" as string]: `${delay}ms`,
        }}
      />
    </div>
  );
}

/**
 * City numbers: crashes, top-end speeds, bikes, drive times.
 */
export function ReportedHook({
  crashBefore,
  crashAfter,
  crashDelta,
  crashTotalBefore,
  crashTotalAfter,
  crashYearsBefore,
  crashYearsAfter,
  bikeBefore,
  bikeAfter,
  bikeDelta,
  bikeYearBefore,
  bikeYearAfter,
  travelBefore,
  travelAfter,
  crashLinks,
  speedLinks,
  bikeLinks,
  travelLinks,
}: Props) {
  const bikeYearExtra = bikeYearAfter - bikeYearBefore;
  const expectedAtOldRate = Math.round(ksiProjectedAtBeforeRate(crashYearsAfter));
  const fewerThanExpected = expectedAtOldRate - crashTotalAfter;
  const crashMax = Math.max(crashBefore, crashAfter);
  const bikeMax = Math.max(bikeBefore, bikeAfter);

  const p95Before = avgP95Speed("before");
  const p95After = avgP95Speed("after");
  const p95Max = Math.max(p95Before, p95After);
  const p95DeltaPct = ((p95After - p95Before) / p95Before) * 100;
  const p95DeltaLabel = `${p95DeltaPct > 0 ? "+" : ""}${p95DeltaPct.toFixed(0)}%`;
  const meanDrop = avgSpeed("before") - avgSpeed("after");
  const worst = maxP95Drop();

  return (
    <div className="story-beats">
      <article className="story-beat" data-beat="crash">
        <p className="beat-kicker">1 · Safety</p>
        <h2>Fewer people killed or badly hurt</h2>
        <div className="beat-visual scale-scene" data-kind="crash">
          <div className="scale-row" data-weight="heavy">
            <div className="scale-meta">
              <span className="beat-when">Before · yearly rate</span>
              <strong className="scale-num">
                {crashBefore.toFixed(1)}
                <span>/ year</span>
              </strong>
            </div>
            <ScaleBar
              share={crashBefore / crashMax}
              tone="crash-before"
              delay={80}
            />
            <p className="beat-rate">
              {crashTotalBefore} serious crashes over {crashYearsBefore} years
              (2016–2022)
            </p>
          </div>

          <div className="scale-row" data-weight="light">
            <div className="scale-meta">
              <span className="beat-when">After · yearly rate</span>
              <strong className="scale-num">
                {crashAfter.toFixed(1)}
                <span>/ year</span>
              </strong>
            </div>
            <ScaleBar
              share={crashAfter / crashMax}
              tone="crash-after"
              delay={220}
            />
            <p className="beat-rate">
              {crashTotalAfter} serious crashes over {crashYearsAfter} years
              (2024–2026)
            </p>
          </div>

          <p className="scale-punch" data-tone="ok">
            <strong>{crashDelta}</strong>
            <span> yearly rate</span>
          </p>
        </div>
        <CalloutList
          items={[
            {
              tone: "ok",
              stat: `−${fewerThanExpected} fewer`,
              text: `If the old yearly rate held for ${crashYearsAfter} years, you would expect about ${expectedAtOldRate}. The after window had ${crashTotalAfter}.`,
            },
          ]}
        />
        <BeatCite links={crashLinks} />
      </article>

      <article className="story-beat" data-beat="speed">
        <p className="beat-kicker">2 · Speeds</p>
        <h2>Fewer cars going way over the limit</h2>
        <p className="beat-sub">
          95th percentile speed — how fast the fastest ~5% of cars are going —
          at five spots on this stretch. Posted limit is now{" "}
          {SPEED.postedLimitKmh} km/h.
        </p>
        <div className="beat-visual scale-scene" data-kind="speed">
          <div className="scale-row" data-weight="heavy">
            <div className="scale-meta">
              <span className="beat-when">
                Before · avg of five sites · {SPEED.labels.before}
              </span>
              <strong className="scale-num">
                {p95Before.toFixed(0)}
                <span>km/h</span>
              </strong>
            </div>
            <ScaleBar
              share={p95Before / p95Max}
              tone="speed-before"
              delay={80}
            />
          </div>

          <div className="scale-row" data-weight="light">
            <div className="scale-meta">
              <span className="beat-when">
                After · same sites · {SPEED.labels.after}
              </span>
              <strong className="scale-num">
                {p95After.toFixed(0)}
                <span>km/h</span>
              </strong>
            </div>
            <ScaleBar
              share={p95After / p95Max}
              tone="speed-after"
              delay={220}
            />
          </div>

          <p className="scale-punch" data-tone="ok">
            <strong>{p95DeltaLabel}</strong>
            <span> average 95th percentile across the five sites</span>
          </p>
        </div>
        <CalloutList
          items={[
            {
              tone: "ok",
              stat: `−${worst.drop.toFixed(0)} km/h`,
              text: `Biggest site drop: ${worst.site} ${worst.before.toFixed(0)} → ${worst.after.toFixed(0)} km/h (95th percentile).`,
            },
            {
              tone: "ok",
              stat: `−${meanDrop.toFixed(0)} km/h`,
              text: "Average (mean) speeds also fell about this much across the same sites — closer to the posted limit.",
            },
          ]}
        />
        <BeatCite links={speedLinks} />
      </article>

      <article className="story-beat" data-beat="bike">
        <p className="beat-kicker">3 · Bike counts</p>
        <h2>More people on bikes</h2>
        <div className="beat-visual scale-scene" data-kind="bike">
          <div className="scale-row" data-weight="light">
            <div className="scale-meta">
              <span className="beat-when">Before · four count spots</span>
              <strong className="scale-num">
                {Math.round(bikeBefore).toLocaleString()}
                <span>/ day</span>
              </strong>
            </div>
            <ScaleBar
              share={bikeBefore / bikeMax}
              tone="bike-before"
              delay={80}
            />
            <p className="beat-rate">
              ≈ {formatApproxTrips(bikeYearBefore)} trips / year
            </p>
          </div>

          <div className="scale-row" data-weight="heavy">
            <div className="scale-meta">
              <span className="beat-when">After · same spots</span>
              <strong className="scale-num">
                {Math.round(bikeAfter).toLocaleString()}
                <span>/ day</span>
              </strong>
            </div>
            <ScaleBar
              share={bikeAfter / bikeMax}
              tone="bike-after"
              delay={220}
            />
            <p className="beat-rate">
              ≈ {formatApproxTrips(bikeYearAfter)} trips / year
            </p>
          </div>

          <p className="scale-punch" data-tone="ok">
            <strong>{bikeDelta}</strong>
            <span> daily riders at the same four spots</span>
          </p>
        </div>
        <CalloutList
          items={[
            {
              tone: "ok",
              stat: `+${formatApproxTrips(bikeYearExtra)}`,
              text: "Rough extra trips per year if every day matched the count days.",
            },
          ]}
        />
        <BeatCite links={bikeLinks} />
      </article>

      <article className="story-beat" data-beat="travel">
        <p className="beat-kicker">4 · Drive times</p>
        <h2>Longer through 2025, then easing</h2>
        <p className="beat-sub">
          End to end on weekday afternoons: about {travelBefore.toFixed(1)}{" "}
          minutes before, peaking near 2025, then {travelAfter.toFixed(1)} in
          2026. The City says the climb tracked city-wide congestion.
        </p>
        <div className="beat-visual travel-scene">
          <TravelImpact beforeMin={travelBefore} afterMin={travelAfter} />
        </div>
        <BeatCite links={travelLinks} />
      </article>
    </div>
  );
}
