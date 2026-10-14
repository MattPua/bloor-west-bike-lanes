/**
 * Ontario CIMA+ advice: keep vs remove, as crash levels relative to “same as now.”
 * Bars share one scale — not decorative dots.
 */
const BASELINE = 100;
/** Midpoint of 35–50% fewer → 50–65 remaining */
const KEEP_LOW = 50;
const KEEP_HIGH = 65;
const KEEP_MID = (KEEP_LOW + KEEP_HIGH) / 2;
/** 54% more → 154 */
const REMOVE = 154;
const SCALE_MAX = 160;

function levelPct(level: number): number {
  return Math.min(100, (level / SCALE_MAX) * 100);
}

export function OntarioHook() {
  return (
    <figure className="step-hook ontario-hook">
      <figcaption className="step-hook-title">
        Crash numbers in the advice
      </figcaption>
      <p className="step-hook-sub">
        CIMA+ and ministry staff compared keeping the bike lanes to taking them
        out. The percentages are relative to crash levels with the lanes in —
        not a count of dots.
      </p>

      <div className="risk-scene">
        <p className="risk-scale-label">
          Relative crash level (same scale for all three)
        </p>

        <div className="risk-row" data-tone="base">
          <div className="risk-row-meta">
            <span className="risk-choice">Lanes stay (baseline)</span>
            <strong className="risk-level">
              {BASELINE}
              <span>%</span>
            </strong>
          </div>
          <div className="risk-track" aria-hidden>
            <div
              className="risk-fill"
              style={{ ["--w" as string]: `${levelPct(BASELINE)}%` }}
            />
          </div>
          <p className="risk-note">Starting point for the comparison</p>
        </div>

        <div className="risk-row" data-tone="keep">
          <div className="risk-row-meta">
            <span className="risk-choice">Keep the bike lanes</span>
            <strong className="risk-level">
              {KEEP_LOW}–{KEEP_HIGH}
              <span>%</span>
            </strong>
          </div>
          <div className="risk-track" aria-hidden>
            <div
              className="risk-fill"
              style={{ ["--w" as string]: `${levelPct(KEEP_MID)}%` }}
            />
          </div>
          <p className="risk-stat">
            <strong>35–50% fewer</strong> crashes — from studies CIMA+ cited
          </p>
        </div>

        <div className="risk-row" data-tone="remove">
          <div className="risk-row-meta">
            <span className="risk-choice">Take them out</span>
            <strong className="risk-level">
              {REMOVE}
              <span>%</span>
            </strong>
          </div>
          <div className="risk-track" aria-hidden>
            <div
              className="risk-fill"
              style={{ ["--w" as string]: `${levelPct(REMOVE)}%` }}
            />
          </div>
          <p className="risk-stat">
            <strong>54% more</strong> crashes — CIMA+ projection if car lanes
            returned
          </p>
        </div>
      </div>

      <p className="step-hook-caption">
        On crashes, the advice said keeping the lanes looked safer.
      </p>
    </figure>
  );
}
