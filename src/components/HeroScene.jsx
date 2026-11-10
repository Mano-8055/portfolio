import { useEffect, useRef } from "react";
import "./HeroScene.css";

/*
  Pure CSS/SVG animated geometric object.
  No WebGL — works on every device, zero bundle cost.
  Mouse-responsive via CSS custom properties.
*/
export default function HeroScene({ isDark }) {
  const wrapRef = useRef(null);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || prefersReduced) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    };
    const onLeave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");
    };
    const onTouch = (e) => {
      const t = e.touches[0];
      if (!t) return;
      const r = el.getBoundingClientRect();
      const x = ((t.clientX - r.left) / r.width  - 0.5) * 2;
      const y = ((t.clientY - r.top)  / r.height - 0.5) * 2;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchmove", onTouch);
    };
  }, [prefersReduced]);

  const accent = isDark ? "#E8A838" : "#C47F10";
  const metal  = isDark ? "#B8B4AA" : "#8A8680";
  const wire   = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const bg     = isDark ? "#111111" : "#FFFFFF";

  return (
    <div
      ref={wrapRef}
      className="geo-scene"
      aria-hidden="true"
      style={{ "--mx": 0, "--my": 0, background: bg }}
    >
      <div className="geo-inner">
        {/* Outer wireframe ring — slow orbit */}
        <div className="geo-orbit geo-orbit-1">
          <svg viewBox="0 0 260 260" className="geo-svg" aria-hidden="true">
            <ellipse
              cx="130" cy="130" rx="118" ry="42"
              fill="none"
              stroke={wire}
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Second ring — angled opposite */}
        <div className="geo-orbit geo-orbit-2">
          <svg viewBox="0 0 260 260" className="geo-svg" aria-hidden="true">
            <ellipse
              cx="130" cy="130" rx="118" ry="42"
              fill="none"
              stroke={accent}
              strokeWidth="0.75"
              strokeDasharray="4 8"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Central octahedron (SVG polygon) */}
        <div className="geo-center">
          <svg viewBox="0 0 200 200" className="geo-poly-svg" aria-hidden="true">
            {/* Back faces */}
            <polygon
              points="100,30 170,110 100,140"
              fill={metal}
              opacity="0.35"
            />
            <polygon
              points="100,30 30,110 100,140"
              fill={metal}
              opacity="0.55"
            />
            {/* Front faces */}
            <polygon
              points="100,170 170,110 100,140"
              fill={metal}
              opacity="0.85"
            />
            <polygon
              points="100,170 30,110 100,140"
              fill={metal}
              opacity="0.65"
            />
            {/* Accent edge */}
            <line x1="100" y1="30" x2="100" y2="170" stroke={accent} strokeWidth="0.75" opacity="0.6" />
            <line x1="30"  y1="110" x2="170" y2="110" stroke={accent} strokeWidth="0.75" opacity="0.4" />
          </svg>
        </div>

        {/* Floating accent dot */}
        <div className="geo-float-dot" style={{ background: accent }} />

        {/* Grid lines */}
        <svg
          viewBox="0 0 300 300"
          className="geo-grid-svg"
          aria-hidden="true"
        >
          {[60, 90, 120, 150, 180, 210, 240].map((y) => (
            <line
              key={y}
              x1="0" y1={y} x2="300" y2={y}
              stroke={wire}
              strokeWidth="1"
            />
          ))}
          {[60, 90, 120, 150, 180, 210, 240].map((x) => (
            <line
              key={x}
              x1={x} y1="0" x2={x} y2="300"
              stroke={wire}
              strokeWidth="1"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
