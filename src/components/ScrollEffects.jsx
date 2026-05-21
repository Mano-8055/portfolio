import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";

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

/* ── Scroll + Mouse Reactive Background ── */
export function ScrollBackground() {
  const { scrollYProgress } = useScroll();

  // Raw mouse position (0–1), initialised to center
  const rawMX = useMotionValue(0.5);
  const rawMY = useMotionValue(0.5);

  useEffect(() => {
    const onMove = (e) => {
      rawMX.set(e.clientX / window.innerWidth);
      rawMY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawMX, rawMY]);

  // Laggy spring for blobs — feels like they float after the cursor
  const blobCfg   = { stiffness: 50, damping: 20, mass: 1.4 };
  // Faster spring for the cursor spotlight
  const spotCfg   = { stiffness: 130, damping: 22 };
  const scrollCfg = { stiffness: 16, damping: 18 };

  const smx = useSpring(rawMX, blobCfg);
  const smy = useSpring(rawMY, blobCfg);
  const spx = useSpring(rawMX, spotCfg);
  const spy = useSpring(rawMY, spotCfg);

  // Scroll base positions (numeric so we can add mouse offset)
  const sb1x = useSpring(useTransform(scrollYProgress, [0, 1], [14, 62]), scrollCfg);
  const sb1y = useSpring(useTransform(scrollYProgress, [0, 1], [12, 82]), scrollCfg);
  const sb2x = useSpring(useTransform(scrollYProgress, [0, 1], [78, 22]), scrollCfg);
  const sb2y = useSpring(useTransform(scrollYProgress, [0, 1], [16, 70]), scrollCfg);
  const sb3x = useSpring(useTransform(scrollYProgress, [0, 1], [50, 30]), scrollCfg);
  const sb3y = useSpring(useTransform(scrollYProgress, [0, 1], [90, 35]), scrollCfg);
  const shY  = useSpring(useTransform(scrollYProgress, [0, 1], [18, 72]), scrollCfg);

  // Merge scroll position + mouse influence for each blob
  // Blob 1 (indigo) — follows mouse forward
  const b1x = useTransform([sb1x, smx], ([s, m]) => `${s + (m - 0.5) * 18}%`);
  const b1y = useTransform([sb1y, smy], ([s, m]) => `${s + (m - 0.5) * 14}%`);

  // Blob 2 (pink) — moves opposite to mouse (depth contrast)
  const b2x = useTransform([sb2x, smx], ([s, m]) => `${s - (m - 0.5) * 16}%`);
  const b2y = useTransform([sb2y, smy], ([s, m]) => `${s - (m - 0.5) * 12}%`);

  // Blob 3 (emerald) — gentle diagonal follow
  const b3x = useTransform([sb3x, smx], ([s, m]) => `${s + (m - 0.5) * 10}%`);
  const b3y = useTransform([sb3y, smy], ([s, m]) => `${s - (m - 0.5) * 8}%`);

  // Horizon band — slight vertical nudge with mouse
  const horizY = useTransform([shY, smy], ([s, m]) => `${s + (m - 0.5) * 6}%`);

  // Cursor spotlight — tight radial that hugs the pointer
  const spotX = useTransform(spx, (v) => `${v * 100}%`);
  const spotY = useTransform(spy, (v) => `${v * 100}%`);

  const blobsBg  = useMotionTemplate`radial-gradient(ellipse 58% 50% at ${b1x} ${b1y}, rgba(99,102,241,0.24) 0%, transparent 65%), radial-gradient(ellipse 52% 58% at ${b2x} ${b2y}, rgba(236,72,153,0.19) 0%, transparent 65%), radial-gradient(ellipse 62% 44% at ${b3x} ${b3y}, rgba(34,197,94,0.15) 0%, transparent 65%)`;
  const horizonBg = useMotionTemplate`radial-gradient(ellipse 100% 28% at 50% ${horizY}, rgba(120,119,198,0.11) 0%, transparent 60%)`;
  const spotBg   = useMotionTemplate`radial-gradient(ellipse 32% 28% at ${spotX} ${spotY}, rgba(255,255,255,0.045) 0%, transparent 68%)`;

  return (
    <div className="scroll-responsive-bg" aria-hidden="true">
      <motion.div className="srb-blobs"   style={{ background: blobsBg }} />
      <motion.div className="srb-horizon" style={{ background: horizonBg }} />
      <motion.div className="srb-cursor"  style={{ background: spotBg }} />
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
