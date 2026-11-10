import { useState, useEffect, useRef, useCallback } from "react";

const GITHUB_USER = "Mano-8055";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["","Mon","","Wed","","Fri",""];

/* ─── Build a 52-week grid ending today ──────────────────────── */
function buildWeeks() {
  const today = new Date();
  today.setHours(0,0,0,0);

  // Start = today minus 364 days, then back to Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay()); // align to Sunday

  const weeks = [];
  let cur = new Date(start);
  while (cur <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(cur);
      date.setDate(cur.getDate() + d);
      if (date <= today) {
        week.push({
          date,
          key: date.toISOString().slice(0,10),
          count: 0,
          level: 0,
        });
      } else {
        week.push(null);
      }
    }
    weeks.push(week);
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

/* ─── Map contribution count to level 0-4 ───────────────────── */
function getLevel(count, max) {
  if (count === 0) return 0;
  if (max === 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.15) return 1;
  if (ratio <= 0.4)  return 2;
  if (ratio <= 0.7)  return 3;
  return 4;
}

/* ─── Month labels: one per column where month changes ──────── */
function buildMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;
  weeks.forEach((week) => {
    const first = week.find(Boolean);
    if (!first) { labels.push(null); return; }
    const m = first.date.getMonth();
    if (m !== lastMonth) {
      labels.push(MONTHS[m]);
      lastMonth = m;
    } else {
      labels.push(null);
    }
  });
  return labels;
}

/* ─── Fetch contribution data ────────────────────────────────── */
async function fetchContributions() {
  // GitHub's public contribution calendar (no auth needed)
  const proxy = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;
  const res = await fetch(proxy, { signal: AbortSignal.timeout?.(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  // Returns { total: {...}, contributions: [{date, count, level}] }
  return data.contributions || [];
}

/* ─── Component ──────────────────────────────────────────────── */
export default function GitHubHeatmap() {
  const [weeks, setWeeks] = useState([]);
  const [total, setTotal] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [tooltip, setTooltip] = useState(null); // {text, x, y}
  const tooltipTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const base = buildWeeks();

    fetchContributions()
      .then((contributions) => {
        if (cancelled) return;
        // Build lookup map
        const map = {};
        contributions.forEach((c) => { map[c.date] = c.count; });
        const maxCount = Math.max(...contributions.map((c) => c.count), 1);

        let sum = 0;
        const filled = base.map((week) =>
          week.map((cell) => {
            if (!cell) return null;
            const count = map[cell.key] ?? 0;
            sum += count;
            return { ...cell, count, level: getLevel(count, maxCount) };
          })
        );
        if (!cancelled) {
          setWeeks(filled);
          setTotal(sum);
          setStatus("ok");
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback: show empty grid rather than error
          setWeeks(base);
          setStatus("error");
        }
      });

    return () => { cancelled = true; };
  }, []);

  const showTooltip = useCallback((cell, e) => {
    if (!cell) return;
    clearTimeout(tooltipTimer.current);
    const label = cell.count === 0
      ? `No contributions on ${cell.key}`
      : `${cell.count} contribution${cell.count > 1 ? "s" : ""} on ${cell.key}`;
    setTooltip({ text: label, x: e.clientX + 10, y: e.clientY - 32 });
  }, []);

  const hideTooltip = useCallback(() => {
    tooltipTimer.current = setTimeout(() => setTooltip(null), 80);
  }, []);

  const monthLabels = weeks.length ? buildMonthLabels(weeks) : [];

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-header">
        <span className="heatmap-title">GitHub Contributions</span>
        {status === "ok" && total !== null && (
          <span className="heatmap-count">
            {total.toLocaleString()} contributions in the last year
          </span>
        )}
        {status === "error" && (
          <span className="heatmap-count" style={{ color: "var(--text-dim)" }}>
            Contribution data unavailable
          </span>
        )}
      </div>

      {status === "loading" ? (
        <div className="heatmap-loading">Loading contribution data…</div>
      ) : (
        <div className="heatmap-grid-outer">
          {/* Month labels */}
          <div
            className="heatmap-month-labels"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, 13px)`,
              paddingLeft: "28px",
            }}
          >
            {monthLabels.map((label, i) => (
              <span key={i} className="heatmap-month-label">
                {label || ""}
              </span>
            ))}
          </div>

          {/* Grid body */}
          <div className="heatmap-body">
            {/* Day labels */}
            <div className="heatmap-day-labels">
              {DAYS.map((d, i) => (
                <span key={i} className="heatmap-day-label">{d}</span>
              ))}
            </div>

            {/* Cells */}
            <div className="heatmap-cells">
              {weeks.map((week, wi) => (
                <div key={wi} className="heatmap-week">
                  {week.map((cell, di) =>
                    cell ? (
                      <div
                        key={cell.key}
                        className="heatmap-cell"
                        data-level={cell.level}
                        role="gridcell"
                        aria-label={`${cell.count} contributions on ${cell.key}`}
                        onMouseEnter={(e) => showTooltip(cell, e)}
                        onMouseLeave={hideTooltip}
                        onMouseMove={(e) =>
                          setTooltip((t) => t ? { ...t, x: e.clientX + 10, y: e.clientY - 32 } : t)
                        }
                      />
                    ) : (
                      <div key={`empty-${wi}-${di}`} style={{ width: 11, height: 11 }} />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="heatmap-legend">
            <span className="heatmap-legend-label">Less</span>
            {[0,1,2,3,4].map((l) => (
              <div key={l} className="heatmap-legend-cell heatmap-cell" data-level={l} />
            ))}
            <span className="heatmap-legend-label">More</span>
          </div>
        </div>
      )}

      {/* Tooltip — rendered in body coordinates via fixed positioning */}
      {tooltip && (
        <div
          className="heatmap-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
          aria-hidden="true"
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
