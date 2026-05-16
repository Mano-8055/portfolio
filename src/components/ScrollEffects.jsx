import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* ── Lenis Smooth Inertia Scroll ── */
export function useLenis() {
  useEffect(() => {
    let lenisInstance = null;
    let rafId = null;
    let mounted = true;

    (async () => {
      try {
        const { default: Lenis } = await import("lenis");
        if (!mounted) return;
        lenisInstance = new Lenis({
          duration: 1.35,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.82,
          touchMultiplier: 1.5,
        });
        const tick = (time) => {
          if (!mounted) return;
          lenisInstance.raf(time);
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      } catch {
        /* falls back to native scroll silently */
      }
    })();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      lenisInstance?.destroy();
    };
  }, []);
}

/* ── Ambient Floating Gradient Blobs ── */
export function FloatingBlobs() {
  const { scrollY } = useScroll();

  const springCfg = { stiffness: 20, damping: 14, mass: 1 };
  const y1 = useSpring(useTransform(scrollY, [0, 4000], [0, -680]), springCfg);
  const y2 = useSpring(useTransform(scrollY, [0, 4000], [0, -300]), springCfg);
  const y3 = useSpring(useTransform(scrollY, [0, 4000], [0, -920]), springCfg);
  const y4 = useSpring(useTransform(scrollY, [0, 4000], [0, -190]), springCfg);

  return (
    <div className="floating-blobs" aria-hidden="true">
      <motion.div className="fblob fblob-1" style={{ y: y1 }} />
      <motion.div className="fblob fblob-2" style={{ y: y2 }} />
      <motion.div className="fblob fblob-3" style={{ y: y3 }} />
      <motion.div className="fblob fblob-4" style={{ y: y4 }} />
    </div>
  );
}

/* ── Mouse-tracking 3D Tilt Card ── */
export function TiltCard({
  children,
  className = "",
  intensity = 10,
  glare = true,
  style,
  ...props
}) {
  const ref = useRef(null);
  const [glarePos, setGlarePos] = useState({ mx: 50, my: 50 });
  const [hovered, setHovered] = useState(false);

  const springCfg = { stiffness: 340, damping: 30, mass: 0.5 };
  const rotateX = useSpring(0, springCfg);
  const rotateY = useSpring(0, springCfg);
  const scale   = useSpring(1, { stiffness: 280, damping: 24 });

  const onMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      rotateX.set((y - 0.5) * -intensity);
      rotateY.set((x - 0.5) * intensity);
      setGlarePos({ mx: x * 100, my: y * 100 });
    },
    [intensity, rotateX, rotateY]
  );

  const onEnter = useCallback(() => {
    scale.set(1.04);
    setHovered(true);
  }, [scale]);

  const onLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setGlarePos({ mx: 50, my: 50 });
    setHovered(false);
  }, [rotateX, rotateY, scale]);

  return (
    <motion.div
      ref={ref}
      className={`tilt-card-wrap ${className}`}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1000,
        ...style,
      }}
      {...props}
    >
      {glare && (
        <div
          className="tilt-glare"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(ellipse at ${glarePos.mx}% ${glarePos.my}%, rgba(255,255,255,0.16) 0%, transparent 62%)`,
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
