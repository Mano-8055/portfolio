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
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.9,
          touchMultiplier: 1.0, // native touch feel on mobile
          infinite: false,
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

/* ── Ambient Floating Gradient Blobs — CSS-only, no scroll JS overhead ── */
export function FloatingBlobs() {
  return (
    <div className="floating-blobs" aria-hidden="true">
      <div className="fblob fblob-1" />
      <div className="fblob fblob-2" />
      <div className="fblob fblob-3" />
      <div className="fblob fblob-4" />
    </div>
  );
}

/* ── Background — pure CSS, zero JS scroll overhead ── */
export function ScrollBackground() {
  return (
    <div className="scroll-responsive-bg" aria-hidden="true">
      <div className="srb-blobs" />
      <div className="srb-horizon" />
    </div>
  );
}

/* ── ParallaxBox – element moves at a different rate than scroll ── */
export function ParallaxBox({ children, offset = 50, className = "", style = {} }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  const smoothY = useSpring(y, { stiffness: 80, damping: 24 });
  return (
    <motion.div ref={ref} style={{ y: smoothY, ...style }} className={className}>
      {children}
    </motion.div>
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
