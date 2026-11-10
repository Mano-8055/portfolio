import { lazy, Suspense } from "react";

/* ─── Fallback while 3D loads ───────────────────────────────────── */
function Hero3DFallback({ isDark }) {
  return (
    <div className="hero-3d-loading" style={{ width: "100%", aspectRatio: "1 / 1", maxWidth: "420px" }}>
      <div className="hero-3d-spinner" style={{ "--accent": isDark ? "#E8A838" : "#C47F10" }} />
    </div>
  );
}

/* ─── Lazy-loaded 3D Hero ───────────────────────────────────────── */
const Hero3DCanvas = lazy(() =>
  import("./Hero3D").then((mod) => ({ default: mod.default }))
);

/* ─── Exported wrapper with Suspense ────────────────────────────── */
export default function Hero3D({ isDark, className = "" }) {
  return (
    <Suspense fallback={<Hero3DFallback isDark={isDark} />}>
      <Hero3DCanvas isDark={isDark} className={className} />
    </Suspense>
  );
}