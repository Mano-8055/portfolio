import emailjs from "emailjs-com";
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { useTheme } from "./context/useTheme";
import GitHubHeatmap from "./components/GitHubHeatmap";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
import "./styles.css";
import profilePhoto from "./assets/manobala.jpg";

import Hero3D from "./components/Hero3D.lazy";
import { preloadHero3D } from "./components/Hero3D.preload";

/* ─── LENIS SMOOTH SCROLL ─────────────────────────────────────── */
function useLenis() {
  useEffect(() => {
    const skip =
      window.matchMedia("(max-width: 768px), (prefers-reduced-motion: reduce)").matches ||
      navigator.connection?.saveData;
    if (skip) return;
    let lenis = null, raf = null, alive = true;
    (async () => {
      try {
        const { default: Lenis } = await import("lenis");
        if (!alive) return;
        lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        const tick = (t) => { if (!alive) return; lenis.raf(t); raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
      } catch { /* native scroll */ }
    })();
    return () => { alive = false; cancelAnimationFrame(raf); lenis?.destroy(); };
  }, []);
}

/* ─── SCROLL REVEAL (native IntersectionObserver) ────────────── */
const prefersReduced =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

function Reveal({ children, delay = 0, className = "", style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(prefersReduced);

  useEffect(() => {
    if (prefersReduced) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: "-40px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(14px)",
        transition: prefersReduced
          ? "none"
          : `opacity 0.5s ${delay}s cubic-bezier(0.22,1,0.36,1), transform 0.5s ${delay}s cubic-bezier(0.22,1,0.36,1)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── GSAP SCROLL REVEAL (advanced) ────────────────────────────── */
function GSAPReveal({
  children,
  delay = 0,
  className = "",
  style,
  stagger = 0,
  y = 40,
  opacity = 0,
  scale = 1,
  rotateX = 0,
  duration = 0.8,
  ease = "power3.out",
  once = true,
  triggerOffset = "top 85%",
}) {
  const ref = useRef(null);
  const isStagger = Array.isArray(children);

  useEffect(() => {
    if (prefersReduced || !ref.current) return;
    const ctx = gsap.context(() => {
      const targets = isStagger
        ? gsap.utils.toArray(ref.current.children)
        : [ref.current];
      if (targets.length === 0) return;

      gsap.from(targets, {
        y,
        opacity,
        scale,
        rotateX,
        duration,
        ease,
        stagger,
        scrollTrigger: {
          trigger: ref.current,
          start: triggerOffset,
          once,
          markers: false,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [delay, stagger, y, opacity, scale, rotateX, duration, ease, once, triggerOffset, isStagger]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

/* ─── PARALLAX WRAPPER ─────────────────────────────────────────── */
function ParallaxLayer({ children, speed = 0.3, className = "", style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReduced || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: -100 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [speed]);
  return <div ref={ref} className={className} style={{ willChange: "transform", ...style }}>{children}</div>;
}

/* ─── FLOATING BLOBS BACKGROUND ────────────────────────────────── */
function FloatingBlobs({ className = "", count = 3 }) {
  const refs = useRef([]);
  useEffect(() => {
    if (prefersReduced) return;
    const ctx = gsap.context(() => {
      refs.current.forEach((ref, i) => {
        if (!ref) return;
        gsap.to(ref, {
          x: gsap.utils.random(-40, 40),
          y: gsap.utils.random(-40, 40),
          rotation: gsap.utils.random(-15, 15),
          scale: gsap.utils.random(0.9, 1.1),
          duration: gsap.utils.random(8, 15),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.5,
        });
      });
    });
    return () => ctx.revert();
  }, []);
  return (
    <div className={`floating-blobs ${className}`} aria-hidden="true">
      {[...Array(count)].map((_, i) => (
        <div key={i} ref={(el) => (refs.current[i] = el)} className="blob" />
      ))}
    </div>
  );
}

/* ─── COUNTER ANIMATION ────────────────────────────────────────── */
function Counter({ end, duration = 2, className = "", style, suffix = "", prefix = "" }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (prefersReduced) { setCount(end); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo({ val: 0 }, { val: end }, {
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 90%", once: true },
        onUpdate: function () { setCount(Math.round(this.targets()[0].val)); },
      });
    }, ref);
    return () => ctx.revert();
  }, [end, duration]);
  return <div ref={ref} className={className} style={style}>{prefix}{count.toLocaleString()}{suffix}</div>;
}

/* ─── NAVBAR SCROLL DETECTION ─────────────────────────────────── */

/* ─── NAVBAR SCROLL DETECTION ─────────────────────────────────── */
function useScrolled(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [threshold]);
  return scrolled;
}

/* ─── SCROLL TO TOP ────────────────────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [pathname]);
  return null;
}

/* ─── ICON HELPER ─────────────────────────────────────────────── */
function Icon({ children, size = 16, ...rest }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
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

/* ─── MOON / SUN ICONS ────────────────────────────────────────── */
function IconMoon() {
  return (
    <Icon>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </Icon>
  );
}
function IconSun() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1"  y1="12" x2="3"  y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </Icon>
  );
}

/* ─── APP ROOT ─────────────────────────────────────────────────── */
function App() {
  useLenis();
  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <ScrollToTop />
          <Navbar />
          <main className="main">
            <PageRoutes />
          </main>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

/* ─── PAGE WRAP ───────────────────────────────────────────────── */
function PageWrap({ children }) {
  return <div className="page-wrap">{children}</div>;
}

function PageRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/"               element={<PageWrap><Home /></PageWrap>} />
      <Route path="/projects"       element={<PageWrap><Projects /></PageWrap>} />
      <Route path="/ui-ux"          element={<PageWrap><UIUXDesign /></PageWrap>} />
      <Route path="/skills"         element={<PageWrap><Skills /></PageWrap>} />
      <Route path="/certifications" element={<PageWrap><Certifications /></PageWrap>} />
      <Route path="/contact"        element={<PageWrap><Contact /></PageWrap>} />
    </Routes>
  );
}

/* ─── SCROLL PROGRESS INDICATOR ─────────────────────────────────── */
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const h = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);
  return progress;
}

/* ─── NAVBAR ───────────────────────────────────────────────────── */
const NAV_LINKS = [
  { to: "/",               label: "Home"           },
  { to: "/projects",       label: "Projects"       },
  { to: "/ui-ux",          label: "UI/UX"          },
  { to: "/skills",         label: "Skills"         },
  { to: "/certifications", label: "Certifications" },
  { to: "/contact",        label: "Contact"        },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(60);
  const { theme, toggle } = useTheme();
  const scrollProgress = useScrollProgress();

  return (
    <>
      <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`} role="banner">
        {/* Brand */}
        <Link to="/" className="nav-left" aria-label="Manobala S — Home">
          <span className="nav-logo">Manobala S</span>
          <span className="nav-sub">Software Engineer</span>
        </Link>

        {/* Desktop nav */}
        <nav className="nav-center" aria-label="Primary navigation">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right controls */}
        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
          <button
            className="hamburger"
            onClick={() => setOpen((p) => !p)}
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            <Motion.span animate={open ? { rotate: 45, y: 5 }   : { rotate: 0, y: 0 }}   transition={{ duration: 0.2 }} />
            <Motion.span animate={open ? { opacity: 0 }          : { opacity: 1 }}         transition={{ duration: 0.15 }} />
            <Motion.span animate={open ? { rotate: -45, y: -5 }  : { rotate: 0, y: 0 }}   transition={{ duration: 0.2 }} />
          </button>
        </div>
      </header>

      {/* Scroll Progress Bar */}
      <div className="scroll-progress" role="progressbar" aria-valuenow={Math.round(scrollProgress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Page scroll progress">
        <div className="scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <Motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <Motion.nav
              className="mobile-drawer"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-label="Mobile navigation"
            >
              <div className="drawer-header">
                <span className="nav-logo">Manobala S</span>
                <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
              </div>
              <div className="drawer-links">
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    className={({ isActive }) => `drawer-link${isActive ? " active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
              <div className="drawer-footer">
                <span className="drawer-footer-label">Theme</span>
                <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
                  {theme === "dark" ? <IconSun /> : <IconMoon />}
                </button>
              </div>
            </Motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── FOOTER ───────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-inner">
        <span className="footer-left">
          © {new Date().getFullYear()} Manobala S ·{" "}
          <a href="mailto:shankarmanogym@gmail.com">shankarmanogym@gmail.com</a>
        </span>
        <div className="footer-links">
          <a href="https://github.com/Mano-8055" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
          <a href="mailto:shankarmanogym@gmail.com" className="footer-link">Email</a>
          <a
            href="https://drive.google.com/file/d/1B0HVAnI4L3NdmkFU4xEfrdl2oFekNOgW/view?usp=share_link"
            target="_blank" rel="noreferrer" className="footer-link"
          >
            Resume
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   HOME
═══════════════════════════════════════════════════════════════ */
function Home() {
  return (
    <div className="page">
      <HeroSection />
      <div className="divider" />
      <AboutSection />
      <div className="divider" />
      <WhatIDoSection />
      <div className="divider" />
      <JourneySection />
      <div className="divider" />
      <ActivitySection />
    </div>
  );
}

/* ─── HERO ─────────────────────────────────────────────────────── */
function HeroSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [preloaded, setPreloaded] = useState(false);

  const handleMouseEnter = () => {
    if (!preloaded) {
      preloadHero3D();
      setPreloaded(true);
    }
  };

  return (
    <>
      {/* Floating background blobs */}
      <FloatingBlobs count={3} />

      <section className="hero" aria-label="Introduction" onMouseEnter={handleMouseEnter}>
        {/* Left */}
        <GSAPReveal stagger={0.1} y={30} duration={1} ease="power3.out">
          <div className="hero-left">
            <p className="hero-eyebrow">Software Engineer</p>
            <h1 className="hero-name">Manobala S</h1>
            <p className="hero-role">Integrated M.Tech Software Engineering · VIT Vellore</p>
            <p className="hero-desc">
              I build web applications with React, work with Python and Java on the
              backend, and spend time on the design side in Figma. Currently in my
              third year, looking for internship opportunities.
            </p>
            <div className="hero-actions">
              <a
                href="https://drive.google.com/file/d/1B0HVAnI4L3NdmkFU4xEfrdl2oFekNOgW/view?usp=share_link"
                className="btn btn-primary magnetic"
                target="_blank"
                rel="noreferrer"
              >
                <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Icon>
                Resume
              </a>
              <Link to="/projects" className="btn btn-outline magnetic">View Projects</Link>
              <Link to="/contact"  className="btn btn-ghost magnetic">Get in touch</Link>
            </div>
            <div className="hero-meta">
              <span className="hero-meta-item">
                <Icon><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon>
                Gudiyatham, Vellore, Tamil Nadu
              </span>
              <span className="hero-meta-item">
                <Icon><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Icon>
                <a href="mailto:shankarmanogym@gmail.com" style={{ color: "inherit" }}>shankarmanogym@gmail.com</a>
              </span>
              <span className="hero-meta-item">
                <Icon><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></Icon>
                <a href="https://github.com/Mano-8055" target="_blank" rel="noreferrer" style={{ color: "inherit" }}>github.com/Mano-8055</a>
              </span>
            </div>
          </div>
        </GSAPReveal>

        {/* Right — Interactive 3D Hero with React Three Fiber */}
        <GSAPReveal y={40} duration={1.2} delay={0.2}>
          <div className="hero-anim">
            <Hero3D isDark={isDark} />
          </div>
        </GSAPReveal>
      </section>
    </>
  );
}

function ProfileCard() {
  return (
    <aside className="hero-card" aria-label="Profile">
      <img src={profilePhoto} alt="Manobala S" className="hero-card-photo" width={340} height={255} />
      <div className="hero-card-body">
        <p className="hero-card-name">Manobala S</p>
        <p className="hero-card-role">Software Engineer</p>
        <div className="hero-card-divider" />
        <p className="hero-card-detail">
          <strong>Degree</strong><br />Integrated M.Tech, Software Engineering
        </p>
        <p className="hero-card-detail" style={{ marginTop: "0.5rem" }}>
          <strong>University</strong><br />VIT Vellore · CGPA 8.4 · Batch 2027
        </p>
        <div className="hero-card-tags">
          {["React", "Python", "Node.js", "MongoDB", "Figma"].map((t) => (
            <span key={t} className="hero-card-tag">{t}</span>
          ))}
        </div>
        <div className="hero-status">
          <span className="hero-status-dot" />
          Open to internships
        </div>
      </div>
    </aside>
  );
}

/* ─── ABOUT ─────────────────────────────────────────────────────── */
function AboutSection() {
  return (
    <section className="section" aria-labelledby="about-heading">
      <GSAPReveal stagger={0.1} y={20} duration={0.8}>
        <p className="section-label">About</p>
        <h2 className="section-title" id="about-heading">Background</h2>
      </GSAPReveal>
      <div className="about-grid" style={{ marginTop: "2rem" }}>
        <GSAPReveal stagger={0.1} y={30} delay={0.1} duration={0.8}>
          <div className="about-text">
            <p>
              I'm studying Integrated M.Tech in Software Engineering at VIT
              Vellore, currently in my third year. My focus is frontend
              development — React is where I spend most of my time — but I've
              worked across the stack with Node.js, MySQL, and MongoDB.
            </p>
            <p>
              I picked up UI/UX work through Figma while building projects.
              Design decisions — spacing, hierarchy, state feedback — directly
              shape how software feels to use, and that overlap with engineering
              is what I find worth paying attention to. I completed NVIDIA's
              Deep Learning Fundamentals course in 2025, which gave me a solid
              grounding in neural networks alongside my web work.
            </p>
            <p>
              I'm from Gudiyatham, Vellore. Outside coursework I build personal
              projects — this portfolio is one of them — and I spend time
              reading about language design, compilers, and how larger systems
              are put together.
            </p>
          </div>
        </GSAPReveal>
        <GSAPReveal stagger={0.12} y={20} delay={0.15} duration={0.7}>
          <div className="about-facts">
            {[
              { label: "Education", value: "Integrated M.Tech, Software Engineering", sub: "VIT Vellore · 2022 – 2027" },
              { label: "Academic Standing", value: "CGPA 8.4", sub: "Out of 10" },
              { label: "Location", value: "Gudiyatham, Vellore", sub: "Tamil Nadu, India" },
              { label: "Contact", value: "shankarmanogym@gmail.com", href: "mailto:shankarmanogym@gmail.com", sub: "+91 9626488199" },
              { label: "Availability", value: "Open to internships", sub: "Software engineering roles" },
            ].map((f) => (
              <div key={f.label} className="fact-block">
                <p className="fact-label">{f.label}</p>
                <p className="fact-value">
                  {f.href
                    ? <a href={f.href} style={{ color: "inherit" }}>{f.value}</a>
                    : f.value}
                </p>
                <p className="fact-sub">{f.sub}</p>
              </div>
            ))}
          </div>
        </GSAPReveal>
      </div>
    </section>
  );
}

/* ─── WHAT I DO ─────────────────────────────────────────────────── */
const SERVICES = [
  {
    title: "Frontend Development",
    desc: "React applications with clean component architecture, responsive layouts, and accessible interfaces.",
    icon: <Icon><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Icon>,
  },
  {
    title: "Backend & Databases",
    desc: "REST APIs with Node.js and PHP, relational data in MySQL, document storage in MongoDB.",
    icon: <Icon><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></Icon>,
  },
  {
    title: "UI/UX Design",
    desc: "Wireframes and prototypes in Figma, from rough flows through to component-level design handoffs.",
    icon: <Icon><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></Icon>,
  },
  {
    title: "Deep Learning",
    desc: "Neural network architectures and training pipelines. NVIDIA DLI certified.",
    icon: <Icon><rect x="5" y="5" width="14" height="14" rx="1"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="5"/><line x1="15" y1="2" x2="15" y2="5"/><line x1="9" y1="19" x2="9" y2="22"/><line x1="15" y1="19" x2="15" y2="22"/><line x1="2" y1="9" x2="5" y2="9"/><line x1="2" y1="15" x2="5" y2="15"/><line x1="19" y1="9" x2="22" y2="9"/><line x1="19" y1="15" x2="22" y2="15"/></Icon>,
  },
  {
    title: "Cloud Fundamentals",
    desc: "Core Azure services, infrastructure concepts, and cloud architecture. Microsoft AZ-900 certified.",
    icon: <Icon><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></Icon>,
  },
  {
    title: "Dev Tooling",
    desc: "Git, VS Code, npm, and the tooling around building, linting, and deploying web projects.",
    icon: <Icon><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></Icon>,
  },
];

function WhatIDoSection() {
  return (
    <section className="section" aria-labelledby="whatido-heading">
      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Capabilities</p>
        <h2 className="section-title" id="whatido-heading">What I work on</h2>
      </GSAPReveal>
      <GSAPReveal stagger={0.12} y={30} delay={0.1} duration={0.7} className="services-grid" style={{ marginTop: "1.5rem" }}>
        {SERVICES.map((s) => (
          <div key={s.title} className="service-item">
            <div className="service-icon">{s.icon}</div>
            <p className="service-title">{s.title}</p>
            <p className="service-desc">{s.desc}</p>
          </div>
        ))}
      </GSAPReveal>
    </section>
  );
}

/* ─── JOURNEY TIMELINE ──────────────────────────────────────────── */
const TIMELINE = [
  { year: "2022",        title: "Started at VIT Vellore",             desc: "Enrolled in Integrated M.Tech Software Engineering. Started with structured programming, data structures, and introductory web courses." },
  { year: "2023 – 2024", title: "Built the frontend foundation",       desc: "Worked through React, JavaScript in depth, and picked up Figma. Completed several academic and personal projects across web and database courses." },
  { year: "Sep 2025",    title: "NVIDIA Deep Learning Fundamentals",   desc: "Completed NVIDIA DLI's Fundamentals of Deep Learning course — neural network architectures, training loops, and GPU-accelerated computing." },
  { year: "Nov 2025",    title: "Quantum Computing — VIT SCORE",       desc: "Completed Quantum Computing using Qiskit as a value-added course at VIT Vellore." },
  { year: "Feb 2026",    title: "Scrimba React Certification",         desc: "Completed the Learn React course on Scrimba — hooks, component patterns, state management, and building small apps end to end." },
  { year: "Jul 2026",    title: "Microsoft Azure Fundamentals AZ-900", desc: "Passed the AZ-900 exam. Core Azure services, cloud concepts, and pricing models." },
  { year: "2027",        title: "Graduation — target",                 desc: "Completing the integrated M.Tech in 2027." },
];

function JourneySection() {
  return (
    <section className="section" aria-labelledby="journey-heading">
      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Timeline</p>
        <h2 className="section-title" id="journey-heading">Education & Milestones</h2>
      </GSAPReveal>
      <div className="timeline" style={{ marginTop: "2rem" }}>
        {TIMELINE.map((item, i) => (
          <GSAPReveal key={item.year + item.title} delay={i * 0.08} y={20} duration={0.6} triggerOffset="top 90%">
            <div className="timeline-item">
              <span className="timeline-dot" aria-hidden="true" />
              <p className="timeline-year">{item.year}</p>
              <p className="timeline-title">{item.title}</p>
              <p className="timeline-desc">{item.desc}</p>
            </div>
          </GSAPReveal>
        ))}
      </div>
    </section>
  );
}

/* ─── GITHUB ACTIVITY ───────────────────────────────────────────── */
function ActivitySection() {
  return (
    <section className="section" aria-labelledby="activity-heading">
      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Activity</p>
        <h2 className="section-title" id="activity-heading">GitHub</h2>
        <p className="section-body" style={{ marginTop: "0.4rem" }}>
          Contribution history for{" "}
          <a
            href="https://github.com/Mano-8055"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
          >
            @Mano-8055
          </a>
        </p>
      </GSAPReveal>
      <GSAPReveal delay={0.15} y={30} duration={0.8} style={{ marginTop: "1.5rem" }}>
        <GitHubHeatmap />
      </GSAPReveal>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTS
═══════════════════════════════════════════════════════════════ */
function timeAgo(dateStr) {
  const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (d === 0) return "today";
  if (d < 30)  return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12)  return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}

function normUrl(url) {
  const s = String(url || "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function getLiveUrl(repo) {
  const hp = normUrl(repo.homepage);
  if (repo.full_name?.toLowerCase() === "mano-8055/portfolio")
    return typeof window !== "undefined" ? window.location.origin : hp;
  return hp;
}

// Language categories for filter
const LANG_FILTERS = [
  { label: "All", value: "all" },
  { label: "JavaScript", value: "JavaScript" },
  { label: "TypeScript", value: "TypeScript" },
  { label: "Python", value: "Python" },
  { label: "HTML",   value: "HTML" },
  { label: "CSS",    value: "CSS" },
  { label: "Other",  value: "other" },
];

// Tilt card effect
function useTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.setProperty("--rx", `${y * -4}deg`);
      el.style.setProperty("--ry", `${x *  4}deg`);
    };
    const onLeave = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [ref]);
}

function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  useTilt(ref);
  return (
    <div ref={ref} className={className} data-tilt>
      {children}
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <>
      <div className="proj-skeleton" style={{ marginTop: "2.5rem" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="proj-skeleton-card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-lang" />
            </div>
            <div className="skeleton-line skeleton-line-desc" />
            <div className="skeleton-line skeleton-line-desc2" />
          </div>
        ))}
      </div>
    </>
  );
}

function Projects() {
  const [repos, setRepos]   = useState([]);
  const [loading, setLoad]  = useState(true);
  const [error, setError]   = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "https://api.github.com/users/Mano-8055/repos?sort=pushed&direction=desc&per_page=30"
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setRepos(data.filter((r) => !r.fork && !r.archived).slice(0, 16));
      } catch {
        setError("Could not load repositories. Check your connection or try again later.");
      } finally {
        setLoad(false);
      }
    })();
  }, []);

  // Filter without re-fetching
  const filtered = filter === "all"
    ? repos
    : filter === "other"
      ? repos.filter((r) => !["JavaScript","TypeScript","Python","HTML","CSS"].includes(r.language))
      : repos.filter((r) => r.language === filter);

  const featured = filtered[0] ?? null;
  const rest     = filtered.slice(1);
  const liveUrl  = featured ? getLiveUrl(featured) : null;

  return (
    <div className="page">
      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Work</p>
        <h1 className="section-title">Projects</h1>
        <p className="section-body" style={{ marginTop: "0.4rem" }}>
          Repositories from{" "}
          <a href="https://github.com/Mano-8055" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
            github.com/Mano-8055
          </a>{" "}
          — sorted by most recently pushed.
        </p>
      </GSAPReveal>

      {loading && <ProjectSkeleton />}
      {error   && <p className="proj-error">{error}</p>}

      {!loading && !error && (
        <>
          {/* Filter bar */}
          <GSAPReveal delay={0.04} y={20} duration={0.6} style={{ marginTop: "2rem" }}>
            <div className="proj-filters-wrap">
              <div className="proj-filters" role="group" aria-label="Filter by language">
                {LANG_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    className={`proj-filter-btn${filter === f.value ? " active" : ""}`}
                    onClick={() => setFilter(f.value)}
                    aria-pressed={filter === f.value}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </GSAPReveal>

          {filtered.length === 0 && (
            <p className="proj-loading">No repositories match this filter.</p>
          )}

          {featured && (
            <GSAPReveal delay={0.06} y={30} duration={0.8}>
              {/* Featured spotlight */}
              <div className="proj-featured">
                <p className="proj-featured-eyebrow">Most recently active</p>
                <h2 className="proj-featured-name">{featured.name}</h2>
                <p className="proj-featured-desc">
                  {featured.description || "No description provided."}
                </p>
                <div className="proj-featured-meta">
                  {featured.language && (
                    <span className="proj-meta-item">
                      <Icon size={11}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Icon>
                      {featured.language}
                    </span>
                  )}
                  <span className="proj-meta-item">
                    <Icon size={11}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>
                    {featured.stargazers_count}
                  </span>
                  <span className="proj-meta-item">Updated {timeAgo(featured.pushed_at)}</span>
                </div>
                <div className="proj-featured-actions">
                  <a href={featured.html_url} target="_blank" rel="noreferrer" className="btn btn-outline magnetic">
                    <Icon><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></Icon>
                    View on GitHub
                  </a>
                  {liveUrl && (
                    <a href={liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary magnetic">
                      <Icon><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>
                      Live Demo
                    </a>
                  )}
                </div>
              </div>

              {/* Rest grid */}
              {rest.length > 0 && (
                <div className="proj-grid-wrap">
                  <p className="proj-grid-label">More repositories</p>
                  <div className="proj-grid">
                    {rest.map((repo) => {
                      const url = getLiveUrl(repo);
                      return (
                        <GSAPReveal key={repo.id} stagger={0.1} y={30} delay={0.1} duration={0.7}>
                          <TiltCard className="proj-card">
                            <div className="proj-card-top">
                              <p className="proj-card-name">{repo.name}</p>
                              {repo.language && (
                                <span className="proj-card-lang">{repo.language}</span>
                              )}
                            </div>
                            <p className="proj-card-desc">
                              {repo.description || "No description provided."}
                            </p>
                            <div className="proj-card-footer">
                              <div className="proj-card-stats">
                                <span className="proj-stat">
                                  <Icon size={10}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Icon>
                                  {repo.stargazers_count}
                                </span>
                                <span className="proj-stat">
                                  <Icon size={10}><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></Icon>
                                  {repo.forks_count}
                                </span>
                                <span className="proj-stat" style={{ opacity: 0.6 }}>
                                  {timeAgo(repo.pushed_at)}
                                </span>
                              </div>
                              <div className="proj-card-links">
                                <a href={repo.html_url} target="_blank" rel="noreferrer" className="proj-link">GitHub</a>
                                {url && (
                                  <a href={url} target="_blank" rel="noreferrer" className="proj-link proj-link-accent">Live</a>
                                )}
                              </div>
                            </div>
                          </TiltCard>
                        </GSAPReveal>
                      );
                    })}
                  </div>
                </div>
              )}
            </GSAPReveal>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   UI/UX
═══════════════════════════════════════════════════════════════ */
const DESIGN_PROCESS = [
  { num: "01", title: "Research",   desc: "User interviews, competitive analysis, and mapping pain points before touching any design tool." },
  { num: "02", title: "Wireframe",  desc: "Low-fidelity sketches to work out information architecture and navigation flows quickly." },
  { num: "03", title: "Prototype",  desc: "Interactive Figma prototypes for testing flows and gathering feedback before visual polish." },
  { num: "04", title: "Deliver",    desc: "Developer-ready files with components, spacing specs, and clear handoff documentation." },
];

const DESIGN_PROJECTS = [
  {
    title: "Portfolio Design System",
    category: "Personal",
    desc: "Component library and design tokens built in Figma to prototype this portfolio's visual language before writing CSS.",
    tags: ["Figma", "Design Tokens", "Components"],
    status: "Completed",
  },
  {
    title: "MIE App UI",
    category: "Academic",
    desc: "Mobile UI concept for an investor–entrepreneur matchmaking app. Covers user flows, wireframes, and a hi-fi Figma prototype.",
    tags: ["Mobile UI", "User Flow", "Figma"],
    status: "Prototype",
  },
  {
    title: "E-commerce Checkout",
    category: "UX Concept",
    desc: "UX audit and redesign of a standard e-commerce checkout — reduced step count, inline validation, and clearer progress states.",
    tags: ["UX Research", "Interaction Design"],
    status: "Concept",
  },
];

const DESIGN_TOOLS = ["Figma", "Adobe XD", "Canva", "CSS Animations", "Framer"];

function UIUXDesign() {
  return (
    <div className="page">
      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Design</p>
        <h1 className="section-title">UI / UX</h1>
        <p className="section-body" style={{ marginTop: "0.4rem" }}>
          I approach design from an engineering perspective — thinking about
          component reuse, accessibility, and how layouts translate to code.
        </p>
      </GSAPReveal>

      <section className="section-sm" style={{ marginTop: "3rem" }}>
        <GSAPReveal stagger={0.1} y={20} duration={0.6}>
          <p className="section-label">Process</p>
          <h2 className="section-title" style={{ fontSize: "1.25rem" }}>How I work</h2>
        </GSAPReveal>
        <GSAPReveal stagger={0.12} y={30} delay={0.1} duration={0.7} className="uiux-process-grid" style={{ marginTop: "1.25rem" }}>
          {DESIGN_PROCESS.map((p) => (
            <div key={p.num} className="uiux-step">
              <p className="uiux-step-num">{p.num}</p>
              <p className="uiux-step-title">{p.title}</p>
              <p className="uiux-step-desc">{p.desc}</p>
            </div>
          ))}
        </GSAPReveal>
      </section>

      <section className="section-sm">
        <GSAPReveal stagger={0.1} y={20} duration={0.6}>
          <p className="section-label">Work</p>
          <h2 className="section-title" style={{ fontSize: "1.25rem" }}>Design projects</h2>
        </GSAPReveal>
        <GSAPReveal stagger={0.12} y={30} delay={0.1} duration={0.7}>
          <div className="uiux-projects-list" style={{ marginTop: "1.25rem" }}>
            {DESIGN_PROJECTS.map((p) => (
              <div key={p.title} className="uiux-proj-row">
                <div>
                  <p className="uiux-proj-title">{p.title}</p>
                  <p className="uiux-proj-desc">{p.desc}</p>
                  <div className="uiux-proj-tags">
                    {p.tags.map((t) => <span key={t} className="uiux-tag">{t}</span>)}
                  </div>
                </div>
                <p className="uiux-proj-status">{p.status}</p>
              </div>
            ))}
          </div>
        </GSAPReveal>
      </section>

      <section className="section-sm">
        <GSAPReveal stagger={0.1} y={20} duration={0.6}>
          <p className="section-label">Tools</p>
          <h2 className="section-title" style={{ fontSize: "1.25rem" }}>What I use</h2>
        </GSAPReveal>
        <GSAPReveal stagger={0.12} y={20} delay={0.1} duration={0.6} className="uiux-tools" style={{ marginTop: "1.25rem" }}>
          {DESIGN_TOOLS.map((t) => (
            <div key={t} className="uiux-tool-item">
              <span className="uiux-tool-dot" />
              <span className="uiux-tool-name">{t}</span>
            </div>
          ))}
        </GSAPReveal>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKILLS
═══════════════════════════════════════════════════════════════ */
const SKILL_GROUPS = [
  { label: "Languages",              primary: ["JavaScript", "Python", "Java"],                             secondary: ["PHP", "HTML", "CSS"] },
  { label: "Frameworks & Libraries", primary: ["React"],                                                    secondary: ["Node.js", "Express"] },
  { label: "Databases",              primary: ["MySQL", "MongoDB"],                                         secondary: [] },
  { label: "Design & Tooling",       primary: ["Figma", "Git"],                                             secondary: ["VS Code", "Canva"] },
  { label: "Other",                  primary: ["Deep Learning (NVIDIA DLI)", "Azure Fundamentals (AZ-900)"], secondary: ["Quantum Computing (Qiskit)"] },
];

function Skills() {
  return (
    <div className="page">
      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Technical</p>
        <h1 className="section-title">Skills</h1>
        <p className="section-body" style={{ marginTop: "0.4rem" }}>
          Languages, frameworks, and tools I use regularly.
        </p>
      </GSAPReveal>

      <div className="skills-groups" style={{ marginTop: "3rem" }}>
        {SKILL_GROUPS.map((g, i) => (
          <GSAPReveal key={g.label} delay={i * 0.08} stagger={0.08} y={20} duration={0.6} className="skill-group">
            <p className="skill-group-label">{g.label}</p>
            <div className="skill-tags">
              {g.primary.map((s)   => <span key={s} className="skill-tag primary">{s}</span>)}
              {g.secondary.map((s) => <span key={s} className="skill-tag">{s}</span>)}
            </div>
          </GSAPReveal>
        ))}
      </div>

      <div className="divider" style={{ marginTop: "3rem" }} />

      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Interpersonal</p>
        <h2 className="section-title" style={{ fontSize: "1.25rem" }}>Working style</h2>
      </GSAPReveal>
      <GSAPReveal stagger={0.12} y={20} delay={0.1} duration={0.6} className="skill-tags" style={{ marginTop: "1rem" }}>
        {["Communication", "Teamwork", "Problem Solving"].map((s) => (
          <span key={s} className="skill-tag">{s}</span>
        ))}
      </GSAPReveal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CERTIFICATIONS
═══════════════════════════════════════════════════════════════ */
const CERTS = [
  {
    title: "Fundamentals of Deep Learning",
    issuer: "NVIDIA Deep Learning Institute",
    date: "22 September 2025",
    ids: ["TOt4sbDURj-z5dlIvsIlNQ", "1tO0Ys3ITkGJkXM3sgBKrQ"],
    link: "https://drive.google.com/file/d/179mDybl6HvDQ857jLs_Usb1ZiGevphRA/view?usp=drivesdk",
    icon: <Icon><rect x="5" y="5" width="14" height="14" rx="1"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="5"/><line x1="15" y1="2" x2="15" y2="5"/><line x1="9" y1="19" x2="9" y2="22"/><line x1="15" y1="19" x2="15" y2="22"/><line x1="2" y1="9" x2="5" y2="9"/><line x1="2" y1="15" x2="5" y2="15"/><line x1="19" y1="9" x2="22" y2="9"/><line x1="19" y1="15" x2="22" y2="15"/></Icon>,
  },
  {
    title: "Quantum Computing using Qiskit",
    issuer: "SCORE School · VIT Vellore",
    date: "9 November 2025",
    ids: ["VAC-QP-152"],
    link: "https://drive.google.com/file/d/156TVOLB716CcfK_7R2gF-VCA_CKv8rSp/view?usp=drivesdk",
    icon: <Icon><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="8" ry="3.5"/><ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="8" ry="3.5" transform="rotate(-60 12 12)"/></Icon>,
  },
  {
    title: "Learn React",
    issuer: "Scrimba",
    date: "4 February 2026",
    ids: ["VTLO18RT2L44"],
    link: "https://drive.google.com/file/d/1DUIXY6gv35V4ttmdETDOSv7lE3_ir5hx/view?usp=drivesdk",
    icon: <Icon><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></Icon>,
  },
  {
    title: "Azure Fundamentals AZ-900",
    issuer: "Microsoft",
    date: "19 July 2026",
    ids: ["F08CE0B023BFD512"],
    link: "https://learn.microsoft.com/api/credentials/share/en-gb/ManobalaS-2270/F08CE0B023BFD512?sharingId=3F97F45DCEBB7620",
    icon: <Icon><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></Icon>,
  },
];

function Certifications() {
  return (
    <div className="page">
      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Credentials</p>
        <h1 className="section-title">Certifications</h1>
        <p className="section-body" style={{ marginTop: "0.4rem" }}>
          Verified certifications with credential IDs.
        </p>
      </GSAPReveal>
      <GSAPReveal stagger={0.12} y={30} delay={0.1} duration={0.7} style={{ marginTop: "2.5rem" }}>
        <div className="certs-list">
          {CERTS.map((c) => (
            <div key={c.title} className="cert-row">
              <div className="cert-icon">{c.icon}</div>
              <div className="cert-info">
                <p className="cert-title">{c.title}</p>
                <p className="cert-issuer">{c.issuer}</p>
                <div className="cert-meta">
                  <span className="cert-date">{c.date}</span>
                  {c.ids.map((id) => <code key={id} className="cert-id">{id}</code>)}
                </div>
              </div>
              <a href={c.link} target="_blank" rel="noreferrer" className="cert-link magnetic">
                View
                <Icon size={10}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></Icon>
              </a>
            </div>
          ))}
        </div>
      </GSAPReveal>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONTACT
═══════════════════════════════════════════════════════════════ */
const CONTACT_ROWS = [
  { label: "Email",    value: "shankarmanogym@gmail.com",    href: "mailto:shankarmanogym@gmail.com", icon: <Icon><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></Icon> },
  { label: "Phone",    value: "+91 9626488199",               href: "tel:+919626488199",               icon: <Icon><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></Icon> },
  { label: "Location", value: "Gudiyatham, Vellore – 632602", href: null,                              icon: <Icon><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon> },
  { label: "GitHub",   value: "github.com/Mano-8055",         href: "https://github.com/Mano-8055",   icon: <Icon><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></Icon> },
];

function Contact() {
  const [status, setStatus] = useState("idle");
  useEffect(() => {
    if (status !== "sent") return;
    const t = setTimeout(() => setStatus("idle"), 5000);
    return () => clearTimeout(t);
  }, [status]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("sending");
    emailjs
      .sendForm("service_jh1mgvn", "template_xy8ra8e", e.target, "crw0OW6hsz2xKetZA")
      .then(() => { setStatus("sent"); e.target.reset(); })
      .catch(() => setStatus("error"));
  };

  const busy = status === "sending" || status === "sent";

  return (
    <div className="page">
      <GSAPReveal stagger={0.1} y={20} duration={0.7}>
        <p className="section-label">Contact</p>
        <h1 className="section-title">Get in touch</h1>
        <p className="section-body" style={{ marginTop: "0.4rem" }}>
          Open to software engineering internships and freelance web projects.
        </p>
      </GSAPReveal>

      <div className="contact-grid" style={{ marginTop: "3rem" }}>
        <GSAPReveal delay={0.1} y={30} duration={0.7}>
          <div>
            <p className="contact-info-body">
              Email is the best way to reach me.
            </p>
            <div className="contact-rows">
              {CONTACT_ROWS.map((row) => (
                <div key={row.label} className="contact-row">
                  <div className="contact-row-icon">{row.icon}</div>
                  <div>
                    <p className="contact-row-label">{row.label}</p>
                    {row.href ? (
                      <a
                        href={row.href}
                        className="contact-row-value"
                        target={row.href.startsWith("http") ? "_blank" : undefined}
                        rel="noreferrer"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span className="contact-row-value">{row.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GSAPReveal>

        <GSAPReveal delay={0.15} y={30} duration={0.7}>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="user_name">Name</label>
                <input id="user_name" name="user_name" type="text" placeholder="Your name" required disabled={busy} />
              </div>
              <div className="form-field">
                <label htmlFor="user_email">Email</label>
                <input id="user_email" name="user_email" type="email" placeholder="your@email.com" required disabled={busy} />
              </div>
            </div>
            <div className="form-field full">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={6} placeholder="Tell me about the opportunity or project…" required disabled={busy} />
            </div>

            <AnimatePresence mode="wait">
              {status === "sent" && (
                <Motion.div key="ok" className="form-status form-status-ok"
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Icon size={12}><polyline points="20 6 9 17 4 12"/></Icon>
                  Message sent. I'll be in touch.
                </Motion.div>
              )}
              {status === "error" && (
                <Motion.div key="err" className="form-status form-status-err"
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Icon size={12}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Icon>
                  Something went wrong. Try again or email me directly.
                </Motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="btn btn-primary" disabled={busy} style={{ alignSelf: "flex-start" }}>
              {status === "sending" ? (
                <><span className="form-spinner" /> Sending…</>
              ) : status === "sent" ? (
                <><Icon size={12}><polyline points="20 6 9 17 4 12"/></Icon> Sent</>
              ) : (
                <>
                  Send message
                  <Icon size={12}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>
                </>
              )}
            </button>
          </form>
        </GSAPReveal>
      </div>
    </div>
  );
}

export default App;
