import emailjs from "emailjs-com";
import React, { Suspense, lazy, useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import {
  motion as Motion,
  AnimatePresence,
  useInView,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import "./styles.css";
import profilePhoto from "./assets/manobala.jpg";
import {
  FloatingBlobs,
  TiltCard,
  ScrollBackground,
} from "./components/ScrollEffects.jsx";

const Orb = lazy(() => import("./components/Orb.tsx"));

function useLeanMotion() {
  const [lean, setLean] = useState(true);

  useEffect(() => {
    const media = window.matchMedia(
      "(max-width: 1024px), (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)",
    );
    const update = () =>
      setLean(media.matches || Boolean(navigator.connection?.saveData));

    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return lean;
}

function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const shouldSkip =
      window.matchMedia(
        "(max-width: 1024px), (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)",
      ).matches || navigator.connection?.saveData;

    if (shouldSkip) return;

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
          touchMultiplier: 1.0,
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
  }, [enabled]);
}

function App() {
  const leanMotion = useLeanMotion();
  const premiumEffects = !leanMotion;
  useLenis(premiumEffects);
  const [loaded, setLoaded] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!loaded ? (
        <LoadingScreen key="loader" onDone={() => setLoaded(true)} />
      ) : (
        <Motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Router>
            <div className="app">
              <ScrollToTop />
              <div className="bg-grid" aria-hidden="true" />
              <ScrollBackground />
              {premiumEffects && <FloatingBlobs />}
              {premiumEffects && (
                <div className="hero-orb-bg">
                  <Suspense fallback={null}>
                    <Orb hue={0} hoverIntensity={0.3} rotateOnHover={true} />
                  </Suspense>
                </div>
              )}
              <ScrollProgress />
              <Navbar />
              <main className="main">
                <PageRoutes />
              </main>
              <Footer />
            </div>
          </Router>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [pathname]);

  return null;
}

/* ---------------- LOADING SCREEN ---------------- */
const STARS = Array.from({ length: 22 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  sz: 0.7 + Math.random() * 1.5,
  del: Math.random() * 4,
  dur: 2.5 + Math.random() * 3.5,
}));

function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0);
  const leanMotion = useLeanMotion();

  useEffect(() => {
    const start = performance.now();
    const DURATION = 2500;
    let frame;
    const tick = (now) => {
      const p = Math.min(Math.round(((now - start) / DURATION) * 100), 100);
      setPct(p);
      if (p < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const timeout = setTimeout(onDone, DURATION);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, [leanMotion, onDone]);

  const NAME = "MANOBALA";
  const loadLabel =
    pct < 28
      ? "Loading environment"
      : pct < 60
        ? "Compiling assets"
        : pct < 88
          ? "Rendering modules"
          : pct < 100
            ? "Finalizing"
            : "Complete";

  const corners = [
    { cls: "ls-tl", ix: -16, iy: -16 },
    { cls: "ls-tr", ix: 16, iy: -16 },
    { cls: "ls-bl", ix: -16, iy: 16 },
    { cls: "ls-br", ix: 16, iy: 16 },
  ];

  return (
    <Motion.div
      className="ls-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(14px)" }}
      transition={{ duration: 0.82, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* ── Star field ── */}
      <div className="ls-stars" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="ls-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.sz}px`,
              height: `${s.sz}px`,
              animationDelay: `${s.del}s`,
              animationDuration: `${s.dur}s`,
            }}
          />
        ))}
      </div>

      {/* ── Aurora gradient blobs ── */}
      <div className="ls-aurora" aria-hidden="true">
        <div className="ls-aurora-1" />
        <div className="ls-aurora-2" />
        <div className="ls-aurora-3" />
      </div>

      {/* ── Corner brackets ── */}
      {corners.map(({ cls, ix, iy }) => (
        <Motion.div
          key={cls}
          className={`ls-corner ${cls}`}
          initial={{ opacity: 0, x: ix, y: iy }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        />
      ))}

      {/* ── Full-screen shimmer sweep ── */}
      <Motion.div
        className="ls-sweep"
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{ delay: 1.95, duration: 0.55, ease: [0.4, 0, 0.6, 1] }}
        aria-hidden="true"
      />

      {/* ── Centre stage ── */}
      <div className="ls-center">
        <div className="ls-rings" style={{ perspective: "700px" }}>
          <div className="ls-ring ls-ring-1" />
          <div className="ls-ring ls-ring-2" />
          <div className="ls-ring ls-ring-3" />
        </div>

        <div className="ls-text">
          {/* Init label — fades in then out before name reveals */}
          <Motion.p
            className="ls-init"
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: [0, 1, 1, 0], y: [7, 0, 0, -7] }}
            transition={{ times: [0, 0.12, 0.68, 1], duration: 1.15 }}
          >
            ◈&nbsp;&nbsp;INITIALIZING SYSTEM
          </Motion.p>

          {/* Name */}
          <div className="ls-name-wrap" style={{ perspective: "500px" }}>
            {NAME.split("").map((ch, i) => (
              <Motion.span
                key={i}
                className="ls-letter"
                initial={{
                  opacity: 0,
                  y: 44,
                  rotateX: 90,
                  filter: "blur(8px)",
                }}
                animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                transition={{
                  delay: 0.64 + i * 0.08,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  display: "inline-block",
                  transformStyle: "preserve-3d",
                }}
              >
                {ch}
              </Motion.span>
            ))}
          </div>

          {/* Divider line */}
          <div className="ls-divider-wrap">
            <Motion.div
              className="ls-divider"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                delay: 1.7,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: "center" }}
            />
          </div>

          {/* Role */}
          <Motion.p
            className="ls-role"
            initial={{ opacity: 0, letterSpacing: "0.65em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ delay: 1.62, duration: 0.95, ease: "easeOut" }}
          >
            SOFTWARE ENGINEER
          </Motion.p>
        </div>
      </div>

      {/* ── Footer progress ── */}
      <Motion.div
        className="ls-footer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <div className="ls-footer-top">
          <span className="ls-load-label">{loadLabel}</span>
          <span className="ls-pct">{String(pct).padStart(3, " ")}%</span>
        </div>
        <div className="ls-bar-track">
          <Motion.div
            className="ls-bar-fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: leanMotion ? 1 : 1.8, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
          <Motion.div
            className="ls-bar-glow"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              delay: leanMotion ? 0 : 0.2,
              duration: leanMotion ? 0.9 : 1.6,
              ease: "linear",
            }}
          />
        </div>
      </Motion.div>
    </Motion.div>
  );
}

/* ---------------- SCROLL PROGRESS BAR ---------------- */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <Motion.div
      className="scroll-progress-bar"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/* ---------------- PAGE TRANSITION ---------------- */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.28, ease: "easeIn" } },
};

function PageWrap({ children }) {
  return (
    <Motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </Motion.div>
  );
}

function PageRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrap>
              <Home />
            </PageWrap>
          }
        />
        <Route
          path="/projects"
          element={
            <PageWrap>
              <Projects />
            </PageWrap>
          }
        />
        <Route
          path="/ui-ux"
          element={
            <PageWrap>
              <UIUXDesign />
            </PageWrap>
          }
        />
        <Route
          path="/skills"
          element={
            <PageWrap>
              <Skills />
            </PageWrap>
          }
        />
        <Route
          path="/certifications"
          element={
            <PageWrap>
              <Certifications />
            </PageWrap>
          }
        />
        <Route
          path="/contact"
          element={
            <PageWrap>
              <Contact />
            </PageWrap>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

/* ---------------- NAVBAR ---------------- */
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 70));

  const links = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/ui-ux", label: "UI/UX" },
    { to: "/skills", label: "Skills" },
    { to: "/certifications", label: "Certifications" },
    { to: "/contact", label: "Contact" },
  ];

  const handleNav = () => setOpen(false);

  return (
    <>
      <Motion.header
        className={`navbar${scrolled ? " navbar-scrolled" : ""}`}
        initial={false}
        animate={
          scrolled
            ? {
                y: 0,
              }
            : {
                y: 0,
              }
        }
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="navbar-left">
          <Motion.span
            className="logo"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            Manobala S
          </Motion.span>
          <span className="role-tag">Software Engineer (Aspiring)</span>
        </div>

        <nav className="navbar-links desktop-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className="nav-link"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <button
            className="hamburger"
            onClick={() => setOpen((p) => !p)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <Motion.span
              animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
            />
            <Motion.span
              animate={
                open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.2 }}
            />
            <Motion.span
              animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.25 }}
            />
          </button>
        </div>
      </Motion.header>

      <AnimatePresence>
        {open && (
          <>
            <Motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <Motion.nav
              className="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="drawer-header">
                <span className="logo">Manobala S</span>
                <button
                  className="drawer-close"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <div className="drawer-links">
                {links.map((l, i) => (
                  <Motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                  >
                    <NavLink
                      to={l.to}
                      end={l.to === "/"}
                      className="drawer-link"
                      onClick={handleNav}
                    >
                      {l.label}
                    </NavLink>
                  </Motion.div>
                ))}
              </div>
            </Motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- SCROLL REVEAL WRAPPERS ---------------- */
function Reveal({ children, delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const leanMotion = useLeanMotion();
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const variants = {
    hidden: leanMotion
      ? {
          opacity: 0,
          y: 12,
          x: 0,
        }
      : {
          opacity: 0,
          filter: "blur(3px)",
          y: direction === "up" ? 48 : direction === "down" ? -48 : 0,
          x: direction === "left" ? 55 : direction === "right" ? -55 : 0,
        },
    visible: leanMotion
      ? { opacity: 1, y: 0, x: 0 }
      : { opacity: 1, filter: "blur(0px)", y: 0, x: 0 },
  };
  return (
    <Motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{
        duration: leanMotion ? 0.28 : 0.72,
        delay: leanMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </Motion.div>
  );
}

function Reveal3D({ children, delay = 0 }) {
  const ref = useRef(null);
  const leanMotion = useLeanMotion();
  const inView = useInView(ref, { once: true, margin: "-55px" });
  return (
    <Motion.div
      ref={ref}
      initial={
        leanMotion
          ? { opacity: 0, y: 12 }
          : { opacity: 0, y: 72, rotateX: 22, scale: 0.93, filter: "blur(4px)" }
      }
      animate={
        inView
          ? leanMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }
          : {}
      }
      transition={{
        duration: leanMotion ? 0.3 : 1.05,
        delay: leanMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={
        leanMotion
          ? undefined
          : { transformPerspective: 1200, transformOrigin: "50% 0%" }
      }
    >
      {children}
    </Motion.div>
  );
}

/* ---------------- JOURNEY — MILESTONE VIEWER ---------------- */
function JourneySection({ timeline }) {
  const leanMotion = useLeanMotion();
  const [active, setActive] = useState(0);
  const [timerKey, setTimerKey] = useState(0); // bumped on manual select to reset timer
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, margin: "-80px" });

  // Auto-advance only while visible; resets when user picks manually.
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(
      () => setActive((i) => (i + 1) % timeline.length),
      4000,
    );
    return () => clearInterval(t);
  }, [inView, timerKey, timeline.length]);

  const pick = (i) => {
    setActive(i);
    setTimerKey((k) => k + 1);
  };
  const cur = timeline[active];

  return (
    <Motion.section
      className="home-section-block journey-section parallax-section"
      ref={sectionRef}
      initial={{ opacity: 0, y: leanMotion ? 14 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: leanMotion ? 0.08 : 0.16 }}
      transition={{
        duration: leanMotion ? 0.32 : 0.58,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="parallax-bg-orb orb-green" aria-hidden="true" />

      <Reveal3D>
        <h2 className="section-title gradient-text">Journey</h2>
        <p className="section-subtitle">Milestones that shaped who I am.</p>
      </Reveal3D>

      <div className="jstage">
        {/* ── Left: clickable milestone list ── */}
        <div className="jstage-list">
          {timeline.map((item, i) => (
            <Motion.button
              key={item.year}
              className={`jstage-item${active === i ? " jstage-item-active" : ""}`}
              style={{ "--accent": item.accent }}
              onClick={() => pick(i)}
              initial={{ opacity: 0, x: -22 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: 0.12 + i * 0.1,
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="jstage-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="jstage-item-info">
                <span className="jstage-item-year">{item.year}</span>
                <span className="jstage-item-title">{item.title}</span>
              </div>
              <span className="jstage-item-icon" style={{ color: item.accent }}>
                {item.icon}
              </span>
            </Motion.button>
          ))}
        </div>

        {/* ── Right: feature panel ── */}
        <div className="jstage-panel">
          <AnimatePresence mode="wait">
            <Motion.div
              key={active}
              className="jstage-feature card"
              style={{ "--accent": cur.accent }}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Decorative ghost year */}
              <div className="jstage-ghost">{cur.year}</div>

              {/* Icon badge */}
              <div
                className="jstage-feat-icon"
                style={{
                  background: `${cur.accent}1e`,
                  border: `1px solid ${cur.accent}44`,
                  boxShadow: `0 0 28px ${cur.accent}2a`,
                  color: cur.accent,
                }}
              >
                {cur.icon}
              </div>

              {/* Year + index */}
              <div className="jstage-feat-meta">
                <span
                  className="jstage-feat-year"
                  style={{ color: cur.accent }}
                >
                  {cur.year}
                </span>
                <span className="jstage-feat-index">
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(timeline.length).padStart(2, "0")}
                </span>
              </div>

              {/* Accent divider */}
              <div
                className="jstage-feat-divider"
                style={{
                  background: `linear-gradient(90deg, ${cur.accent} 0%, transparent 80%)`,
                }}
              />

              {/* Content */}
              <h3 className="jstage-feat-title">{cur.title}</h3>
              <p className="jstage-feat-desc">{cur.desc}</p>

              {/* Auto-advance progress bar */}
              <div className="jstage-auto-track">
                <Motion.div
                  className="jstage-auto-fill"
                  key={`${active}-${timerKey}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                  style={{ transformOrigin: "left", background: cur.accent }}
                />
              </div>
            </Motion.div>
          </AnimatePresence>

          {/* Step dots */}
          <div className="jstage-dots">
            {timeline.map((item, i) => (
              <button
                key={i}
                className={`jstage-dot${active === i ? " jstage-dot-active" : ""}`}
                style={{ "--accent": item.accent }}
                onClick={() => pick(i)}
                aria-label={`Go to ${item.year}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Motion.section>
  );
}

/* ---------------- SVG ICON PRIMITIVE ---------------- */
function SvgIcon({ children, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---------------- COUNT-UP STAT ---------------- */
function CountUp({ raw }) {
  const ref = useRef(null);
  const leanMotion = useLeanMotion();
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [display, setDisplay] = useState("0");

  // Split "10+" → num=10, suffix="+"  |  "8.4" → num=8.4, suffix=""
  const suffix = raw.replace(/[\d.]/g, "");
  const target = parseFloat(raw);
  const decimals = ((raw.split(".")[1] ?? "").replace(/\D/g, "") || "").length;

  useEffect(() => {
    if (!inView) return;

    const DURATION = leanMotion ? 700 : 1600;
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min((now - startTime) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
      setDisplay((target * eased).toFixed(decimals));
      if (t < 1) requestAnimationFrame(tick);
      else setDisplay(target.toFixed(decimals)); // ensure exact final value
    };
    requestAnimationFrame(tick);
  }, [inView, leanMotion, target, decimals]);

  return (
    <span ref={ref} className="stat-value">
      {display}
      {suffix}
    </span>
  );
}

const PROJECT_ACCENTS = [
  "#6366f1",
  "#06b6d4",
  "#a855f7",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#84cc16",
];

/* ---------------- HOME / HERO ---------------- */
const HERO_ROLES = [
  "Software Engineer",
  "React Developer",
  "UI/UX Designer",
  "ML Enthusiast",
];

function Home() {
  const leanMotion = useLeanMotion();
  const scrollSectionMotion = {
    initial: { opacity: 0, y: leanMotion ? 14 : 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: leanMotion ? 0.1 : 0.18 },
    transition: { duration: leanMotion ? 0.3 : 0.6, ease: [0.22, 1, 0.36, 1] },
  };
  const [roleIdx, setRoleIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setRoleIdx((i) => (i + 1) % HERO_ROLES.length),
      2800,
    );
    return () => clearInterval(t);
  }, []);

  const stats = [
    {
      value: "8.4",
      label: "CGPA",
      icon: (
        <SvgIcon>
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </SvgIcon>
      ),
    },
    {
      value: "2027",
      label: "Graduation",
      icon: (
        <SvgIcon>
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </SvgIcon>
      ),
    },
    {
      value: "10+",
      label: "Projects",
      icon: (
        <SvgIcon>
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </SvgIcon>
      ),
    },
    {
      value: "2+",
      label: "Certifications",
      icon: (
        <SvgIcon>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </SvgIcon>
      ),
    },
  ];

  const services = [
    {
      accent: "#6366f1",
      title: "Frontend Dev",
      desc: "Responsive, interactive UIs with React and modern CSS.",
      icon: (
        <SvgIcon>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </SvgIcon>
      ),
    },
    {
      accent: "#06b6d4",
      title: "Backend Basics",
      desc: "REST APIs, MySQL & MongoDB — connecting data to the interface.",
      icon: (
        <SvgIcon>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </SvgIcon>
      ),
    },
    {
      accent: "#8b5cf6",
      title: "AI / Deep Learning",
      desc: "NVIDIA-certified in Deep Learning fundamentals and neural nets.",
      icon: (
        <SvgIcon>
          <rect x="5" y="5" width="14" height="14" rx="1" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="2" x2="9" y2="5" />
          <line x1="15" y1="2" x2="15" y2="5" />
          <line x1="9" y1="19" x2="9" y2="22" />
          <line x1="15" y1="19" x2="15" y2="22" />
          <line x1="2" y1="9" x2="5" y2="9" />
          <line x1="2" y1="15" x2="5" y2="15" />
          <line x1="19" y1="9" x2="22" y2="9" />
          <line x1="19" y1="15" x2="22" y2="15" />
        </SvgIcon>
      ),
    },
    {
      accent: "#ec4899",
      title: "UI / UX Design",
      desc: "Figma prototypes and design systems that feel intuitive.",
      icon: (
        <SvgIcon>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </SvgIcon>
      ),
    },
    {
      accent: "#f59e0b",
      title: "Dev Tools",
      desc: "Git, VS Code, and modern build tooling for clean workflows.",
      icon: (
        <SvgIcon>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </SvgIcon>
      ),
    },
    {
      accent: "#10b981",
      title: "Responsive Design",
      desc: "Mobile-first layouts that work across every screen size.",
      icon: (
        <SvgIcon>
          <rect x="2" y="4" width="13" height="10" rx="1" />
          <path d="M2 17h13M9 21h4" />
          <rect x="17" y="9" width="5" height="8" rx="1" />
        </SvgIcon>
      ),
    },
  ];

  const stack = [
    "React",
    "JavaScript",
    "Python",
    "Java",
    "MySQL",
    "MongoDB",
    "HTML",
    "CSS",
    "Git",
    "Figma",
    "PHP",
    "Node.js",
  ];

  const timeline = [
    {
      year: "2022",
      accent: "#6366f1",
      title: "Started B.Tech + M.Tech",
      desc: "Joined VIT Vellore for Integrated M.Tech in Software Engineering.",
      icon: (
        <SvgIcon>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </SvgIcon>
      ),
    },
    {
      year: "2025",
      accent: "#06b6d4",
      title: "NVIDIA Certification",
      desc: "Completed Fundamentals of Deep Learning — NVIDIA DLI.",
      icon: (
        <SvgIcon>
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
        </SvgIcon>
      ),
    },
    {
      year: "2025",
      accent: "#14B8A6",
      title: "Quantum computing certification",
      desc: "Completed on VAC Course in VIT Vellore.",
      icon: (
        <SvgIcon>
          <polygon points="12 3 19 7 19 17 12 21 5 17 5 7" />
          <circle cx="12" cy="12" r="2" />
          <line x1="12" y1="5" x2="12" y2="10" />
          <line x1="12" y1="14" x2="12" y2="19" />
        </SvgIcon>
      ),
    },
    {
      year: "2026",
      accent: "#a855f7",
      title: "React Certification",
      desc: "Completed Learn React course on Scrimba.",
      icon: (
        <SvgIcon>
          <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
          <path d="m9 12 2 2 4-4" />
        </SvgIcon>
      ),
    },
    {
      year: "2027",
      accent: "#10b981",
      title: "Graduation (Target)",
      desc: "Completing Integrated M.Tech with strong CGPA and project portfolio.",
      icon: (
        <SvgIcon>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </SvgIcon>
      ),
    },
  ];

  return (
    <div className="home-page">
      {/* ── HERO ── */}
      <Motion.section
        className="section home-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="hero-grid">
          {/* ── LEFT: text column ── */}
          <div className="hero-text">
            {/* Availability badge */}
            <Motion.div
              className="hero-badge"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
            >
              <span className="hero-badge-dot" />
              Available for Internships
            </Motion.div>

            {/* Eyebrow */}
            <Motion.p
              className="hero-eyebrow"
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.23em" }}
              transition={{ duration: 0.9, delay: 0.12 }}
            >
              Hello, I'm
            </Motion.p>

            {/* Name */}
            <Motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Manobala S
            </Motion.h1>

            {/* Accent bar */}
            <Motion.div
              className="hero-title-bar"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.38,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformOrigin: "left" }}
            />

            {/* Cycling role */}
            <div className="hero-role-wrap">
              <AnimatePresence mode="wait">
                <Motion.span
                  key={roleIdx}
                  className="hero-role-text"
                  initial={
                    leanMotion
                      ? { opacity: 0, y: 6 }
                      : { opacity: 0, y: 10, filter: "blur(4px)" }
                  }
                  animate={
                    leanMotion
                      ? { opacity: 1, y: 0 }
                      : { opacity: 1, y: 0, filter: "blur(0px)" }
                  }
                  exit={
                    leanMotion
                      ? { opacity: 0, y: -6 }
                      : { opacity: 0, y: -10, filter: "blur(4px)" }
                  }
                  transition={{
                    duration: leanMotion ? 0.24 : 0.38,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {HERO_ROLES[roleIdx]}
                </Motion.span>
              </AnimatePresence>
            </div>

            {/* Description */}
            <Motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Integrated M.Tech Software Engineering student at VIT Vellore —
              building modern web apps with React, JavaScript, and a strong eye
              for design.
            </Motion.p>

            {/* Buttons */}
            <Motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <a
                href="https://drive.google.com/file/d/1B0HVAnI4L3NdmkFU4xEfrdl2oFekNOgW/view?usp=share_link"
                className="btn btn-primary"
                target="_blank"
                rel="noreferrer"
              >
                Download Resume
              </a>
              <Link to="/contact" className="btn btn-ghost">
                Contact Me
              </Link>
            </Motion.div>

            {/* Info chips */}
            <Motion.div
              className="hero-chips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.62 }}
            >
              <span className="hero-chip">📍 Gudiyatham, Vellore</span>
              <span className="hero-chip">📞 9626488199</span>
              <span className="hero-chip">✉ shankarmanogym@gmail.com</span>
            </Motion.div>
          </div>

          {/* ── RIGHT: profile card ── */}
          <TiltCard
            className="hero-card"
            intensity={7}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.28 }}
          >
            {/* Top gradient accent */}
            <div className="hero-card-accent-bar" />

            {/* Status */}
            <div className="hero-card-status">
              <span className="hcs-dot" />
              Open to Opportunities
            </div>

            {/* Profile row */}
            <div className="hero-card-profile">
              <div className="hero-card-photo-wrap">
                <img
                  src={profilePhoto}
                  className="hero-card-photo"
                  alt="Manobala S"
                />
              </div>
              <div>
                <p className="hero-card-name">Manobala S</p>
                <p className="hero-card-subrole">Aspiring Software Engineer</p>
              </div>
            </div>

            <div className="hero-card-divider" />

            {/* Education */}
            <div>
              <p className="hero-card-heading">Education</p>
              <p className="hero-card-text">
                Integrated M.Tech · Software Engineering
                <br />
                <span className="hero-highlight">
                  VIT Vellore · CGPA 8.4 · Batch 2027
                </span>
              </p>
            </div>

            {/* Tech tags */}
            <div className="hero-card-tags">
              {["React", "Python", "Node.js", "MongoDB", "Figma"].map((t) => (
                <span key={t} className="hero-tag">
                  {t}
                </span>
              ))}
            </div>

            {/* GitHub link */}
            <a
              href="https://github.com/Mano-8055"
              className="hero-card-github"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              github.com/Mano-8055
            </a>
          </TiltCard>
        </div>
      </Motion.section>

      {/* ── STATS BAR ── */}
      <div>
        <Motion.div
          className="stats-bar"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {stats.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="stat-divider" aria-hidden="true" />}
              <Motion.div
                className="stat-item"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span className="stat-icon">{s.icon}</span>
                <CountUp raw={s.value} />
                <span className="stat-label">{s.label}</span>
              </Motion.div>
            </React.Fragment>
          ))}
        </Motion.div>
      </div>

      {/* ── WHAT I DO ── */}
      <Motion.section
        className="home-section-block parallax-section"
        {...scrollSectionMotion}
      >
        <div className="parallax-bg-orb orb-indigo" aria-hidden="true" />
        <Reveal3D>
          <h2 className="section-title gradient-text">What I Do</h2>
          <p className="section-subtitle">
            Areas I focus on and enjoy building in.
          </p>
        </Reveal3D>
        <div className="services-grid">
          {services.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 0.06}
              direction={i % 2 === 0 ? "left" : "right"}
            >
              <TiltCard className="card service-card" intensity={6}>
                <div className="service-inner">
                  <div
                    className="service-icon-wrap"
                    style={{
                      background: s.accent + "1a",
                      borderColor: s.accent + "33",
                      color: s.accent,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div className="service-content">
                    <h3 className="service-title">{s.title}</h3>
                    <p className="service-desc">{s.desc}</p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Motion.section>

      {/* ── TECH STACK MARQUEE ── */}
      <Motion.section
        className="home-section-block parallax-section"
        {...scrollSectionMotion}
      >
        <div className="parallax-bg-orb orb-pink" aria-hidden="true" />
        <Reveal3D delay={0.05}>
          <h2 className="section-title gradient-text">Tech Stack</h2>
        </Reveal3D>
        <div className="marquee-wrapper">
          <Motion.div
            className="marquee-track"
            animate={leanMotion ? { x: 0 } : { x: ["0%", "-50%"] }}
            transition={
              leanMotion
                ? { duration: 0 }
                : { duration: 20, repeat: Infinity, ease: "linear" }
            }
          >
            {(leanMotion ? stack : [...stack, ...stack]).map((tech, i) => (
              <span key={i} className="marquee-chip">
                {tech}
              </span>
            ))}
          </Motion.div>
        </div>
      </Motion.section>

      {/* ── JOURNEY ── */}
      <JourneySection timeline={timeline} />
    </div>
  );
}

/* ---------------- PROJECTS ---------------- */
function timeAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

function normalizeLiveUrl(url) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return null;
  if (/^https?:\/\//i.test(cleanUrl)) return cleanUrl;
  if (cleanUrl.startsWith("//")) return `https:${cleanUrl}`;
  return `https://${cleanUrl}`;
}

function getCurrentSiteUrl() {
  if (typeof window === "undefined") return null;
  return window.location.origin;
}

function getRepoLiveUrl(repo) {
  const homepage = normalizeLiveUrl(repo.homepage);
  const isPortfolioRepo = repo.full_name?.toLowerCase() === "mano-8055/portfolio";

  if (isPortfolioRepo) {
    return getCurrentSiteUrl() || homepage;
  }

  return homepage;
}

function ProjCard({ repo, index, total }) {
  const year = new Date(repo.created_at).getFullYear();
  const accent = PROJECT_ACCENTS[index % PROJECT_ACCENTS.length];
  const liveUrl = getRepoLiveUrl(repo);

  return (
    <Reveal delay={index * 0.06} direction={index % 2 === 0 ? "left" : "right"}>
      <TiltCard className="card card-project" intensity={5}>
        <div className="proj-ghost" style={{ color: accent }}>
          {year}
        </div>
        <div className="proj-top">
          <div
            className="proj-icon-badge"
            style={{
              background: `${accent}1a`,
              border: `1px solid ${accent}38`,
              color: accent,
            }}
          >
            <SvgIcon>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </SvgIcon>
          </div>
          <span className="proj-counter">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "00")}
          </span>
        </div>
        <div className="proj-meta">
          <span className="proj-year-label" style={{ color: accent }}>
            {year}
          </span>
          {repo.language && <span className="proj-lang">{repo.language}</span>}
        </div>
        <div
          className="proj-divider"
          style={{
            background: `linear-gradient(90deg, ${accent}99, transparent)`,
          }}
        />
        <div className="proj-content">
          <h3 className="proj-name">{repo.name}</h3>
          <p className="proj-desc">
            {repo.description || "A GitHub project from my portfolio."}
          </p>
        </div>
        <div className="proj-footer">
          <div className="proj-stats">
            <span className="proj-stat">
              <SvgIcon>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </SvgIcon>
              {repo.stargazers_count}
            </span>
            <span className="proj-stat">
              <SvgIcon>
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </SvgIcon>
              {repo.forks_count}
            </span>
          </div>
          <div className="proj-links">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="proj-link"
            >
              GitHub
            </a>
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="proj-link proj-link-live"
              >
                Live
              </a>
            )}
          </div>
        </div>
        <div className="proj-bar" style={{ background: accent }} />
      </TiltCard>
    </Reveal>
  );
}

function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "https://api.github.com/users/Mano-8055/repos?sort=pushed&direction=desc&per_page=30",
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRepos(data.filter((r) => !r.fork && !r.archived).slice(0, 10));
      } catch {
        setError("Unable to load projects from GitHub right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featured = repos[0] ?? null;
  const gridRepos = repos.slice(1);
  const featuredLiveUrl = featured ? getRepoLiveUrl(featured) : null;

  return (
    <Motion.section
      className="section"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="section-title gradient-text">Projects</h2>
      <p className="section-subtitle">
        Latest repositories from my GitHub, pulled automatically.
      </p>

      {loading && <p className="proj-loading">Loading projects…</p>}
      {error && <p className="proj-error">{error}</p>}

      {!loading && !error && featured && (
        <>
          {/* ── Spotlight — most recently pushed repo ── */}
          <Motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="card proj-spotlight" intensity={3}>
              {/* Gradient top accent */}
              <div className="proj-spot-accent" aria-hidden="true" />

              {/* Ghost year */}
              <div className="proj-spot-ghost">
                {new Date(featured.pushed_at).getFullYear()}
              </div>

              {/* Top row: badge + meta */}
              <div className="proj-spot-top">
                <div className="proj-spot-badge">
                  <span className="proj-spot-dot" />
                  Currently Working
                </div>
                <div className="proj-spot-right">
                  <span className="proj-spot-time">
                    Last commit · {timeAgo(featured.pushed_at)}
                  </span>
                  {featured.language && (
                    <span className="proj-spot-lang">
                      <SvgIcon>
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </SvgIcon>
                      {featured.language}
                    </span>
                  )}
                  <div className="proj-spot-stats">
                    <span className="proj-spot-stat">
                      <SvgIcon>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </SvgIcon>
                      {featured.stargazers_count}
                    </span>
                    <span className="proj-spot-stat">
                      <SvgIcon>
                        <line x1="6" y1="3" x2="6" y2="15" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M18 9a9 9 0 0 1-9 9" />
                      </SvgIcon>
                      {featured.forks_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="proj-spot-divider" />

              {/* Main content */}
              <h2 className="proj-spot-name">{featured.name}</h2>
              <p className="proj-spot-desc">
                {featured.description || "A GitHub project from my portfolio."}
              </p>

              {/* Actions */}
              <div className="proj-spot-actions">
                <a
                  href={featured.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  View on GitHub
                </a>
                {featuredLiveUrl && (
                  <a
                    href={featuredLiveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </TiltCard>
          </Motion.div>

          {/* ── More projects grid ── */}
          {gridRepos.length > 0 && (
            <>
              <p className="proj-grid-label">More Projects</p>
              <div className="cards-grid">
                {gridRepos.map((repo, i) => (
                  <ProjCard
                    key={repo.id}
                    repo={repo}
                    index={i}
                    total={gridRepos.length}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </Motion.section>
  );
}

/* ---------------- UI/UX DESIGN ---------------- */
function UIUXDesign() {
  const designProcess = [
    {
      step: "01",
      accent: "#6366f1",
      title: "Research",
      icon: (
        <SvgIcon>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </SvgIcon>
      ),
      desc: "User interviews, competitive analysis, and defining pain points to ground every design decision in real needs.",
    },
    {
      step: "02",
      accent: "#06b6d4",
      title: "Wireframe",
      icon: (
        <SvgIcon>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </SvgIcon>
      ),
      desc: "Low-fidelity sketches and wireframes to map out information architecture and user flows before committing to visuals.",
    },
    {
      step: "03",
      accent: "#a855f7",
      title: "Prototype",
      icon: (
        <SvgIcon>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </SvgIcon>
      ),
      desc: "Interactive Figma prototypes that simulate the final product experience for early validation and feedback.",
    },
    {
      step: "04",
      accent: "#10b981",
      title: "Deliver",
      icon: (
        <SvgIcon>
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </SvgIcon>
      ),
      desc: "Polished, developer-ready design files with components, tokens, spacing, and clear handoff documentation.",
    },
  ];

  const tools = [
    { name: "Figma", level: 90, color: "#a259ff" },
    { name: "Adobe XD", level: 68, color: "#ff61f6" },
    { name: "Canva", level: 85, color: "#00c4cc" },
    { name: "CSS / Animations", level: 88, color: "#6366f1" },
    { name: "Framer", level: 62, color: "#0055ff" },
  ];

  const designProjects = [
    {
      title: "Portfolio Design System",
      category: "Personal Project",
      desc: "Component library and design tokens built in Figma to prototype and iterate on this portfolio's visual language before writing a single line of CSS.",
      tags: ["Figma", "Design Tokens", "Components"],
      color: "#6366f1",
      status: "Completed",
    },
    {
      title: "VIT Campus App UI",
      category: "Academic Project",
      desc: "Mobile UI concept for a campus event and resource booking app. Covers user flows, low-fi wireframes, and a hi-fi Figma prototype with micro-interactions.",
      tags: ["Mobile UI", "User Flow", "Prototype"],
      color: "#ec4899",
      status: "Prototype",
    },
    {
      title: "E-commerce Checkout Flow",
      category: "UX Concept",
      desc: "UX audit and redesign of a typical e-commerce checkout — reduced step count, added inline validation, and improved perceived cart-to-purchase speed.",
      tags: ["UX Research", "Interaction", "Conversion"],
      color: "#22c55e",
      status: "Concept",
    },
  ];

  const principles = [
    {
      accent: "#f59e0b",
      title: "Clarity First",
      icon: (
        <SvgIcon>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </SvgIcon>
      ),
      desc: "Every element earns its place. If it doesn't guide the user, it doesn't stay.",
    },
    {
      accent: "#22c55e",
      title: "Accessible by Default",
      icon: (
        <SvgIcon>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </SvgIcon>
      ),
      desc: "WCAG contrast ratios, keyboard navigation, and inclusive design from the very start.",
    },
    {
      accent: "#ef4444",
      title: "Performance-Aware",
      icon: (
        <SvgIcon>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </SvgIcon>
      ),
      desc: "Designs that account for loading states, skeletons, and real-world network constraints.",
    },
    {
      accent: "#6366f1",
      title: "Component-Driven",
      icon: (
        <SvgIcon>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </SvgIcon>
      ),
      desc: "Building with atomic design so the system scales without losing visual consistency.",
    },
  ];

  return (
    <Motion.section
      className="section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="uiux-page">
        {/* Header */}
        <Reveal3D>
          <h2 className="section-title gradient-text">UI / UX Design</h2>
          <p className="section-subtitle">
            Crafting interfaces that are intuitive, beautiful, and accessible —
            from first sketch to final pixel.
          </p>
        </Reveal3D>

        {/* Design Process */}
        <section className="home-section-block">
          <Reveal3D>
            <h3 className="uiux-section-heading">Design Process</h3>
          </Reveal3D>
          <div className="process-grid">
            {designProcess.map((p, i) => (
              <Reveal key={p.step} delay={i * 0.1}>
                <TiltCard className="card process-card" intensity={6}>
                  <div className="process-ghost" style={{ color: p.accent }}>
                    {p.step}
                  </div>
                  <div className="process-top">
                    <div
                      className="process-icon-wrap"
                      style={{
                        background: `${p.accent}1a`,
                        border: `1px solid ${p.accent}38`,
                        color: p.accent,
                      }}
                    >
                      {p.icon}
                    </div>
                    <span className="process-step-label">{p.step}</span>
                  </div>
                  <h4 className="process-title">{p.title}</h4>
                  <p className="process-desc">{p.desc}</p>
                  <div
                    className="process-bar"
                    style={{ background: p.accent }}
                  />
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Design Projects */}
        <section className="home-section-block">
          <Reveal3D>
            <h3 className="uiux-section-heading">Design Projects</h3>
          </Reveal3D>
          <div className="uiux-projects-grid">
            {designProjects.map((p, i) => (
              <Reveal
                key={p.title}
                delay={i * 0.1}
                direction={i % 2 === 0 ? "left" : "right"}
              >
                <Motion.div
                  className="card uiux-project-card"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <div
                    className="uiux-card-glow"
                    style={{
                      background: `radial-gradient(circle at 20% 20%, ${p.color}28, transparent 65%)`,
                    }}
                  />
                  <div className="uiux-card-top">
                    <span className="uiux-category">{p.category}</span>
                    <span className="uiux-status">{p.status}</span>
                  </div>
                  <h4 className="card-title uiux-project-title">{p.title}</h4>
                  <p className="card-desc">{p.desc}</p>
                  <div className="uiux-tags">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="uiux-tag"
                        style={{ "--tag-color": p.color }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div
                    className="uiux-accent-line"
                    style={{
                      background: `linear-gradient(90deg, ${p.color}, transparent)`,
                    }}
                  />
                </Motion.div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="home-section-block">
          <Reveal3D>
            <h3 className="uiux-section-heading">Tools & Proficiency</h3>
          </Reveal3D>
          <div className="tools-list">
            {tools.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.07}>
                <div className="tool-row">
                  <span className="tool-name">{t.name}</span>
                  <div className="tool-bar-bg">
                    <Motion.div
                      className="tool-bar-fill"
                      style={{
                        background: `linear-gradient(90deg, ${t.color}, ${t.color}99)`,
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${t.level}%` }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 1.3,
                        delay: i * 0.1,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                  <span className="tool-pct">{t.level}%</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="home-section-block">
          <Reveal3D>
            <h3 className="uiux-section-heading">Design Principles</h3>
          </Reveal3D>
          <div className="principles-grid">
            {principles.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <TiltCard className="card principle-card" intensity={6}>
                  <div className="principle-ghost" style={{ color: p.accent }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div
                    className="principle-icon-wrap"
                    style={{
                      background: `${p.accent}1a`,
                      border: `1px solid ${p.accent}38`,
                      color: p.accent,
                    }}
                  >
                    {p.icon}
                  </div>
                  <h4 className="principle-title">{p.title}</h4>
                  <p className="principle-desc">{p.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </Motion.section>
  );
}

/* ---------------- SKILLS ---------------- */
function Skills() {
  const skills = [
    {
      accent: "#6366f1",
      category: "Programming Languages",
      items: ["Python", "Java"],
      icon: (
        <SvgIcon>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </SvgIcon>
      ),
    },
    {
      accent: "#06b6d4",
      category: "Web Development",
      items: ["HTML", "CSS", "JavaScript", "React", "PHP"],
      icon: (
        <SvgIcon>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </SvgIcon>
      ),
    },
    {
      accent: "#a855f7",
      category: "Databases",
      items: ["MySQL", "MongoDB"],
      icon: (
        <SvgIcon>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </SvgIcon>
      ),
    },
    {
      accent: "#f59e0b",
      category: "Tools",
      items: ["Git", "VS Code", "Figma"],
      icon: (
        <SvgIcon>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </SvgIcon>
      ),
    },
    {
      accent: "#ec4899",
      category: "Soft Skills",
      items: ["Communication", "Teamwork", "Problem Solving"],
      icon: (
        <SvgIcon>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </SvgIcon>
      ),
    },
  ];

  return (
    <Motion.section
      className="section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="section-title gradient-text">Skills</h2>
      <p className="section-subtitle">
        Technical and interpersonal skills I use to build and ship software.
      </p>
      <div className="skills-grid">
        {skills.map((s, i) => (
          <Reveal key={s.category} delay={i * 0.07}>
            <TiltCard className="card card-skill" intensity={6}>
              <div className="skill-ghost" style={{ color: s.accent }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="skill-top">
                <div
                  className="skill-icon-wrap"
                  style={{
                    background: `${s.accent}1a`,
                    border: `1px solid ${s.accent}38`,
                    color: s.accent,
                  }}
                >
                  {s.icon}
                </div>
                <h3 className="skill-category">{s.category}</h3>
              </div>
              <div className="skill-chips">
                {s.items.map((item) => (
                  <span
                    key={item}
                    className="skill-chip"
                    style={{ borderColor: `${s.accent}35` }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Motion.section>
  );
}

/* ---------------- CERTIFICATIONS ---------------- */
/* ---------------- CERTIFICATIONS ---------------- */
const CERTS = [
  {
    accent: "#06b6d4",
    title: "Fundamentals of Deep Learning",
    issuer: "NVIDIA Deep Learning Institute",
    date: "September 22, 2025",
    year: "2025",
    ids: ["TOt4sbDURj-z5dlIvsIlNQ", "1tO0Ys3ITkGJkXM3sgBKrQ"],
    link: "https://drive.google.com/file/d/179mDybl6HvDQ857jLs_Usb1ZiGevphRA/view?usp=drivesdk",
    icon: (
      <SvgIcon>
        <rect x="5" y="5" width="14" height="14" rx="1" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="2" x2="9" y2="5" />
        <line x1="15" y1="2" x2="15" y2="5" />
        <line x1="9" y1="19" x2="9" y2="22" />
        <line x1="15" y1="19" x2="15" y2="22" />
        <line x1="2" y1="9" x2="5" y2="9" />
        <line x1="2" y1="15" x2="5" y2="15" />
        <line x1="19" y1="9" x2="22" y2="9" />
        <line x1="19" y1="15" x2="22" y2="15" />
      </SvgIcon>
    ),
  },
  {
    accent: "#14B8A6",
    title: "Quantum Computing using Qiskit",
    issuer: "SCORE school VIT-Vellore",
    date: "November 09, 2025",
    year: "2025",
    ids: ["VAC-QP-152"],
    link: "https://drive.google.com/file/d/156TVOLB716CcfK_7R2gF-VCA_CKv8rSp/view?usp=drivesdk",
    icon: (
      <SvgIcon>
        <circle cx="12" cy="12" r="2" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" />
        <ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(60 12 12)" />
        <ellipse
          cx="12"
          cy="12"
          rx="8"
          ry="3.5"
          transform="rotate(-60 12 12)"
        />
      </SvgIcon>
    ),
  },
  {
    accent: "#a855f7",
    title: "Learn React",
    issuer: "Scrimba",
    date: "February 04, 2026",
    year: "2026",
    ids: ["VTLO18RT2L44"],
    link: "https://drive.google.com/file/d/1DUIXY6gv35V4ttmdETDOSv7lE3_ir5hx/view?usp=drivesdk",
    icon: (
      <SvgIcon>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </SvgIcon>
    ),
  },
];

function Certifications() {
  return (
    <Motion.section
      className="section"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="section-title gradient-text">Certifications</h2>
      <p className="section-subtitle">
        Verified credentials from industry-recognised platforms.
      </p>

      <div className="certs-list">
        {CERTS.map((c, i) => (
          <Reveal
            key={c.title}
            delay={i * 0.12}
            direction={i % 2 === 0 ? "left" : "right"}
          >
            <TiltCard className="card cert-card" intensity={3}>
              {/* Gradient top accent */}
              <div
                className="cert-accent-line"
                style={{
                  background: `linear-gradient(90deg, transparent, ${c.accent} 30%, ${c.accent} 70%, transparent)`,
                }}
              />

              {/* Ghost year */}
              <div className="cert-ghost" style={{ color: c.accent }}>
                {c.year}
              </div>

              {/* Main body */}
              <div className="cert-body">
                {/* Left: icon badge */}
                <div
                  className="cert-icon-wrap"
                  style={{
                    background: `${c.accent}1a`,
                    border: `1px solid ${c.accent}44`,
                    color: c.accent,
                  }}
                >
                  {c.icon}
                </div>

                {/* Centre: info */}
                <div className="cert-info">
                  <div className="cert-header">
                    <div>
                      <h3 className="cert-title">{c.title}</h3>
                      <p className="cert-issuer">{c.issuer}</p>
                    </div>
                    <div
                      className="cert-verified"
                      style={{
                        color: c.accent,
                        borderColor: `${c.accent}40`,
                        background: `${c.accent}12`,
                      }}
                    >
                      <SvgIcon>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </SvgIcon>
                      Verified
                    </div>
                  </div>

                  <div className="cert-date-row">
                    <SvgIcon>
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </SvgIcon>
                    {c.date}
                  </div>

                  <div className="cert-ids">
                    {c.ids.map((id) => (
                      <code key={id} className="cert-id">
                        {id}
                      </code>
                    ))}
                  </div>

                  <div className="cert-footer">
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noreferrer"
                      className="cert-link"
                      style={{
                        color: c.accent,
                        borderColor: `${c.accent}40`,
                        background: `${c.accent}0f`,
                      }}
                    >
                      View Certificate
                      <SvgIcon>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </SvgIcon>
                    </a>
                    <span className="cert-counter">
                      {String(i + 1).padStart(2, "0")} /{" "}
                      {String(CERTS.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Motion.section>
  );
}

/* ---------------- CONTACT ---------------- */
function Contact() {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  useEffect(() => {
    if (status === "sent") {
      const t = setTimeout(() => setStatus("idle"), 5000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    emailjs
      .sendForm(
        "service_jh1mgvn",
        "template_xy8ra8e",
        e.target,
        "crw0OW6hsz2xKetZA",
      )
      .then(
        () => {
          setStatus("sent");
          e.target.reset();
        },
        () => {
          setStatus("error");
        },
      );
  };

  const contactRows = [
    {
      label: "Email",
      value: "shankarmanogym@gmail.com",
      href: "mailto:shankarmanogym@gmail.com",
      accent: "#6366f1",
      icon: (
        <SvgIcon>
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m2 7 10 7 10-7" />
        </SvgIcon>
      ),
    },
    {
      label: "Phone",
      value: "+91 9626488199",
      href: "tel:9626488199",
      accent: "#10b981",
      icon: (
        <SvgIcon>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </SvgIcon>
      ),
    },
    {
      label: "Location",
      value: "Gudiyatham, Vellore – 632602",
      href: null,
      accent: "#f59e0b",
      icon: (
        <SvgIcon>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </SvgIcon>
      ),
    },
    {
      label: "GitHub",
      value: "github.com/Mano-8055",
      href: "https://github.com/Mano-8055",
      accent: "#a855f7",
      icon: (
        <SvgIcon>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </SvgIcon>
      ),
    },
  ];

  return (
    <Motion.section
      className="section"
      id="contact-cta"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <h2 className="section-title gradient-text">Contact</h2>
      <p className="section-subtitle">
        Got an opportunity, idea, or collaboration in mind? Drop a message.
      </p>

      {/* Availability banner */}
      <Motion.div
        className="ctc-banner"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <span className="ctc-banner-dot" />
        Available for Internships · Usually responds within 24 hours
      </Motion.div>

      <div className="contact-grid">
        {/* ── Left: info card ── */}
        <Reveal direction="left">
          <div className="card ctc-info-card">
            <div>
              <h3 className="ctc-info-heading">Let's Connect</h3>
              <p className="ctc-info-desc">
                Open to software engineering internships, freelance web
                projects, and interesting technical collaborations.
              </p>
            </div>
            <div className="ctc-rows">
              {contactRows.map((row) => (
                <div key={row.label} className="ctc-row">
                  <div
                    className="ctc-icon"
                    style={{
                      background: `${row.accent}1a`,
                      border: `1px solid ${row.accent}38`,
                      color: row.accent,
                    }}
                  >
                    {row.icon}
                  </div>
                  <div className="ctc-row-info">
                    <span className="ctc-row-label">{row.label}</span>
                    {row.href ? (
                      <a
                        href={row.href}
                        className="ctc-row-value"
                        target={
                          row.href.startsWith("http") ? "_blank" : undefined
                        }
                        rel="noreferrer"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span className="ctc-row-value">{row.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Right: form ── */}
        <Reveal direction="right">
          <form className="card ctc-form" onSubmit={handleSubmit} noValidate>
            <h3 className="ctc-form-heading">Send a Message</h3>

            <div className="ctc-fields">
              <div className="ctc-field">
                <label>Name</label>
                <input
                  name="user_name"
                  type="text"
                  placeholder="Your name"
                  required
                  disabled={status === "sending" || status === "sent"}
                />
              </div>
              <div className="ctc-field">
                <label>Email</label>
                <input
                  name="user_email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  disabled={status === "sending" || status === "sent"}
                />
              </div>
              <div className="ctc-field ctc-field-full">
                <label>Message</label>
                <textarea
                  name="message"
                  rows="5"
                  placeholder="Tell me about your project or opportunity…"
                  required
                  disabled={status === "sending" || status === "sent"}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {status === "sent" && (
                <Motion.div
                  key="ok"
                  className="ctc-status ctc-status-ok"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <SvgIcon>
                    <polyline points="20 6 9 17 4 12" />
                  </SvgIcon>
                  Message sent successfully! I'll get back to you soon.
                </Motion.div>
              )}
              {status === "error" && (
                <Motion.div
                  key="err"
                  className="ctc-status ctc-status-err"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <SvgIcon>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </SvgIcon>
                  Something went wrong. Please try again.
                </Motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="btn btn-primary ctc-submit"
              disabled={status === "sending" || status === "sent"}
            >
              {status === "sending" ? (
                <>
                  <span className="ctc-spinner" /> Sending…
                </>
              ) : status === "sent" ? (
                <>
                  <SvgIcon>
                    <polyline points="20 6 9 17 4 12" />
                  </SvgIcon>
                  Sent!
                </>
              ) : (
                <>
                  Send Message
                  <SvgIcon>
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </SvgIcon>
                </>
              )}
            </button>
          </form>
        </Reveal>
      </div>
    </Motion.section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/ui-ux", label: "UI/UX" },
    { to: "/skills", label: "Skills" },
    { to: "/certifications", label: "Certs" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <footer className="footer">
      <div className="footer-accent-line" aria-hidden="true" />
      <div className="footer-glow" aria-hidden="true" />

      <div className="footer-body">
        <div className="footer-brand">
          <span className="footer-logo">Manobala S</span>
          <span className="footer-tagline">
            Aspiring Software Engineer · VIT Vellore
          </span>
          <span className="footer-available">
            <span className="footer-available-dot" />
            Open to Internships
          </span>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="footer-nav-link">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="footer-social">
          <a
            href="https://github.com/Mano-8055"
            className="footer-social-link"
            target="_blank"
            rel="noreferrer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
          <a
            href="mailto:shankarmanogym@gmail.com"
            className="footer-social-link"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m2 7 10 7 10-7" />
            </svg>
            Email
          </a>
          <a href="tel:9626488199" className="footer-social-link">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Phone
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Manobala S</span>
        <span className="footer-sep">·</span>
        <span>Built with React &amp; Framer Motion</span>
        <span className="footer-sep">·</span>
        <span>Batch 2027</span>
      </div>
    </footer>
  );
}

export default App;
