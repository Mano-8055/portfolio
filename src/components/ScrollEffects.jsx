import { useEffect, useRef, useState, useCallback } from "react";
import { motion as Motion, useScroll, useTransform, useSpring } from "framer-motion";

function useCanTilt() {
  const [canTilt, setCanTilt] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1025px) and (hover: hover) and (pointer: fine)");
    const update = () => setCanTilt(media.matches && !navigator.connection?.saveData);

    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return canTilt;
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
    <Motion.div ref={ref} style={{ y: smoothY, ...style }} className={className}>
      {children}
    </Motion.div>
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
  const canTilt = useCanTilt();
  const [glarePos, setGlarePos] = useState({ mx: 50, my: 50 });
  const [hovered, setHovered] = useState(false);

  const springCfg = { stiffness: 340, damping: 30, mass: 0.5 };
  const rotateX = useSpring(0, springCfg);
  const rotateY = useSpring(0, springCfg);
  const scale   = useSpring(1, { stiffness: 280, damping: 24 });

  const onMove = useCallback(
    (e) => {
      if (!canTilt) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      rotateX.set((y - 0.5) * -intensity);
      rotateY.set((x - 0.5) * intensity);
      setGlarePos({ mx: x * 100, my: y * 100 });
    },
    [canTilt, intensity, rotateX, rotateY]
  );

  const onEnter = useCallback(() => {
    if (!canTilt) return;
    scale.set(1.04);
    setHovered(true);
  }, [canTilt, scale]);

  const onLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setGlarePos({ mx: 50, my: 50 });
    setHovered(false);
  }, [rotateX, rotateY, scale]);

  return (
    <Motion.div
      ref={ref}
      className={`tilt-card-wrap ${className}`}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: canTilt ? 1000 : undefined,
        ...style,
      }}
      {...props}
    >
      {glare && canTilt && (
        <div
          className="tilt-glare"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(ellipse at ${glarePos.mx}% ${glarePos.my}%, rgba(255,255,255,0.16) 0%, transparent 62%)`,
          }}
        />
      )}
      {children}
    </Motion.div>
  );
}
