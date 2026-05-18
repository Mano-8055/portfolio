import { useEffect } from "react";

export default function VantaDots() {
  useEffect(() => {
    // Create and append container directly to body so position:fixed
    // isn't trapped inside framer-motion's animated stacking context.
    const el = document.createElement("div");
    el.className = "vanta-bg";
    document.body.appendChild(el);

    let effect = null;
    let cancelled = false;

    (async () => {
      const THREE = await import("three");
      // vanta captures window.THREE at module-eval time, so set it first.
      window.THREE = THREE;
      const { default: DOTS } = await import("vanta/dist/vanta.dots.min");
      if (cancelled) return;

      effect = DOTS({
        el,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x6366f1,
        color2: 0xa855f7,
        backgroundColor: 0x020617,
        backgroundAlpha: 1,
        size: 3.5,
        spacing: 30,
        showLines: false,
      });
    })();

    return () => {
      cancelled = true;
      if (effect) effect.destroy();
      if (document.body.contains(el)) document.body.removeChild(el);
    };
  }, []);

  return null;
}
