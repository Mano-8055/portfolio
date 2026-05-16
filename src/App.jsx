import emailjs from "emailjs-com";
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useInView, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";
import "./styles.css";
import Orb from "./components/Orb.tsx";
import { useLenis, FloatingBlobs, TiltCard } from "./components/ScrollEffects.jsx";

function App() {
  useLenis();
  const [loaded, setLoaded]   = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.className = darkMode ? "dark-body" : "light-body";
  }, [darkMode]);

  return (
    <AnimatePresence mode="wait">
      {!loaded ? (
        <LoadingScreen key="loader" onDone={() => setLoaded(true)} />
      ) : (
        <motion.div
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Router>
            <div className={`app ${darkMode ? "app-dark" : "app-light"}`}>
              <div className="bg-grid" aria-hidden="true" />
              <FloatingBlobs />
              <div className="hero-orb-bg">
                <Orb hue={0} hoverIntensity={0.3} rotateOnHover={true} />
              </div>
              <ScrollProgress />
              <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
              <main className="main">
                <PageRoutes />
              </main>
              <Footer />
            </div>
          </Router>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- LOADING SCREEN ---------------- */
function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const start   = performance.now();
    const DURATION = 3000;
    let frame;

    const tick = (now) => {
      const p = Math.min(Math.round(((now - start) / DURATION) * 100), 100);
      setPct(p);
      if (p < 100) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const timeout = setTimeout(onDone, DURATION);
    return () => { cancelAnimationFrame(frame); clearTimeout(timeout); };
  }, [onDone]);

  const NAME = "MANOBALA";

  return (
    <motion.div
      className="ls-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: "blur(10px)" }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Ambient glow */}
      <div className="ls-glow" />

      {/* Orbit rings + centered text */}
      <div className="ls-center">
        <div className="ls-rings" style={{ perspective: "700px" }}>
          <div className="ls-ring ls-ring-1" />
          <div className="ls-ring ls-ring-2" />
          <div className="ls-ring ls-ring-3" />
        </div>

        <div className="ls-text">
          <div className="ls-name" style={{ perspective: "500px" }}>
            {NAME.split("").map((ch, i) => (
              <motion.span
                key={i}
                className="ls-letter"
                initial={{ opacity: 0, y: 48, rotateX: 90, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.35 + i * 0.085, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "inline-block", transformStyle: "preserve-3d" }}
              >
                {ch}
              </motion.span>
            ))}
          </div>

          <motion.p
            className="ls-role"
            initial={{ opacity: 0, letterSpacing: "0.7em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ delay: 1.25, duration: 0.9, ease: "easeOut" }}
          >
            SOFTWARE ENGINEER
          </motion.p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="ls-footer">
        <div className="ls-bar-track">
          <motion.div
            className="ls-bar-fill"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 3, ease: "linear" }}
            style={{ transformOrigin: "left" }}
          />
        </div>
        <span className="ls-pct">{pct}%</span>
      </div>
    </motion.div>
  );
}

/* ---------------- SCROLL PROGRESS BAR ---------------- */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/* ---------------- PAGE TRANSITION ---------------- */
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.28, ease: "easeIn" } },
};

function PageWrap({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function PageRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"              element={<PageWrap><Home /></PageWrap>} />
        <Route path="/projects"      element={<PageWrap><Projects /></PageWrap>} />
        <Route path="/ui-ux"         element={<PageWrap><UIUXDesign /></PageWrap>} />
        <Route path="/skills"        element={<PageWrap><Skills /></PageWrap>} />
        <Route path="/certifications" element={<PageWrap><Certifications /></PageWrap>} />
        <Route path="/contact"       element={<PageWrap><Contact /></PageWrap>} />
      </Routes>
    </AnimatePresence>
  );
}

/* ---------------- NAVBAR ---------------- */
function Navbar({ darkMode, setDarkMode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 70));

  const links = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/ui-ux", label: "UI/UX" },
    { to: "/skills", label: "Skills" },
    { to: "/certifications", label: "Certs" },
    { to: "/contact", label: "Contact" },
  ];

  const handleNav = () => setOpen(false);

  return (
    <>
      <motion.header
        className={`navbar${scrolled ? " navbar-scrolled" : ""}`}
        animate={scrolled ? {
          boxShadow: "0 4px 40px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.07), inset 0 -1px 0 rgba(99,102,241,0.2)",
        } : {
          boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="navbar-left">
          <span className="logo">Manobala S</span>
          <span className="role-tag">Software Engineer (Aspiring)</span>
        </div>

        <nav className="navbar-links desktop-nav">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className="nav-link">{l.label}</NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={() => setDarkMode(p => !p)} aria-label="Toggle theme">
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button
            className="hamburger"
            onClick={() => setOpen(p => !p)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <motion.span animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25 }} />
            <motion.span animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} />
            <motion.span animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.25 }} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              className="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="drawer-header">
                <span className="logo">Manobala S</span>
                <button className="drawer-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
              </div>
              <div className="drawer-links">
                {links.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                  >
                    <NavLink to={l.to} end={l.to === "/"} className="drawer-link" onClick={handleNav}>
                      {l.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
              <div className="drawer-footer">
                <button className="theme-toggle" onClick={() => setDarkMode(p => !p)} aria-label="Toggle theme">
                  {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- SCROLL REVEAL WRAPPERS ---------------- */
function Reveal({ children, delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const variants = {
    hidden: {
      opacity: 0,
      filter: "blur(3px)",
      y: direction === "up" ? 48 : direction === "down" ? -48 : 0,
      x: direction === "left" ? 55 : direction === "right" ? -55 : 0,
    },
    visible: { opacity: 1, filter: "blur(0px)", y: 0, x: 0 },
  };
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ duration: 0.72, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Reveal3D({ children, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-55px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 72, rotateX: 22, scale: 0.93, filter: "blur(4px)" }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" } : {}}
      transition={{ duration: 1.05, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200, transformOrigin: "50% 0%" }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- JOURNEY SECTION ---------------- */
function JourneySection({ timeline }) {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const progress = scrollLeft / (scrollWidth - clientWidth);
      const idx = Math.round(progress * (timeline.length - 1));
      setActive(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [timeline.length]);

  const scrollTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.children[i];
    if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setActive(i);
  };

  return (
    <section className="home-section-block journey-section" ref={sectionRef}>
      <Reveal3D>
        <h2 className="section-title gradient-text">Journey</h2>
        <p className="section-subtitle">Milestones that shaped who I am.</p>
      </Reveal3D>

      <div className="journey-dots">
        {timeline.map((_, i) => (
          <button key={i} className={`journey-dot ${i === active ? "jd-active" : ""}`} onClick={() => scrollTo(i)} aria-label={`Go to milestone ${i + 1}`} />
        ))}
      </div>

      <div className="journey-track" ref={trackRef}>
        {timeline.map((item, i) => (
          <motion.div
            key={item.year}
            className={`journey-card card ${i === active ? "jc-active" : ""}`}
            initial={{ opacity: 0, y: 50, rotateY: -8 }}
            animate={inView ? { opacity: i === active ? 1 : 0.55, y: 0, rotateY: 0 } : {}}
            transition={{ delay: i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => scrollTo(i)}
            whileHover={{ scale: 1.04, y: -6, rotateY: 2 }}
            style={{ transformPerspective: 900 }}
          >
            <div className="jc-glow" />
            <div className="jc-number">{String(i + 1).padStart(2, "0")}</div>
            <div className="jc-year">{item.year}</div>
            <h3 className="jc-title">{item.title}</h3>
            <p className="jc-desc">{item.desc}</p>
            <motion.div
              className="jc-line"
              initial={{ scaleX: 0 }}
              animate={i === active ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </motion.div>
        ))}
      </div>

      <div className="journey-progress-bar">
        <motion.div
          className="journey-progress-fill"
          animate={{ width: `${(active / (timeline.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </section>
  );
}

/* ---------------- HOME / HERO ---------------- */
function Home() {
  const { scrollY } = useScroll();

  // Parallax depth layers for hero
  const heroTextY    = useTransform(scrollY, [0, 600], [0, -130]);
  const heroCardY    = useTransform(scrollY, [0, 600], [0, -60]);
  const heroOpacity  = useTransform(scrollY, [0, 420], [1, 0]);
  const heroScale    = useTransform(scrollY, [0, 450], [1, 0.95]);
  const heroRotateX  = useTransform(scrollY, [0, 520], [0, 9]);

  const smoothTextY  = useSpring(heroTextY,  { stiffness: 75, damping: 22 });
  const smoothCardY  = useSpring(heroCardY,  { stiffness: 75, damping: 22 });
  const smoothScale  = useSpring(heroScale,  { stiffness: 75, damping: 22 });
  const smoothRotateX = useSpring(heroRotateX, { stiffness: 60, damping: 20 });

  const stats = [
    { value: "8.4", label: "CGPA" },
    { value: "2027", label: "Graduation" },
    { value: "10+", label: "Projects" },
    { value: "2+", label: "Certifications" },
  ];

  const services = [
    { icon: "⚛️", title: "Frontend Dev",      desc: "Building responsive, interactive UIs with React and modern CSS." },
    { icon: "🗄️", title: "Backend Basics",    desc: "REST APIs, MySQL & MongoDB — connecting data to the interface." },
    { icon: "🤖", title: "AI / Deep Learning", desc: "NVIDIA-certified in Deep Learning fundamentals and neural networks." },
    { icon: "🎨", title: "UI / UX Design",    desc: "Figma prototypes and design systems that feel intuitive." },
    { icon: "🔧", title: "Dev Tools",          desc: "Git, VS Code, and modern build tooling for clean workflows." },
    { icon: "📱", title: "Responsive Design",  desc: "Mobile-first layouts that work across every screen size." },
  ];

  const stack = ["React", "JavaScript", "Python", "Java", "MySQL", "MongoDB", "HTML", "CSS", "Git", "Figma", "PHP", "Node.js"];

  const timeline = [
    { year: "2022", title: "Started B.Tech + M.Tech",  desc: "Joined VIT Vellore for Integrated M.Tech in Software Engineering." },
    { year: "2025", title: "NVIDIA Certification",     desc: "Completed Fundamentals of Deep Learning — NVIDIA DLI." },
    { year: "2026", title: "React Certification",      desc: "Completed Learn React course on Scrimba." },
    { year: "2027", title: "Graduation (Target)",      desc: "Completing Integrated M.Tech with strong CGPA and project portfolio." },
  ];

  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <motion.section
        className="section home-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          className="hero-parallax-layer"
          style={{ opacity: heroOpacity, scale: smoothScale, perspective: "1300px" }}
        >
          <div className="hero-grid">

            <motion.div className="hero-text" style={{ y: smoothTextY, rotateX: smoothRotateX, transformOrigin: "50% 100%" }}>
              <motion.p
                className="hero-eyebrow"
                initial={{ opacity: 0, letterSpacing: "0.5em" }}
                animate={{ opacity: 1, letterSpacing: "0.23em" }}
                transition={{ duration: 0.9, delay: 0.1 }}
              >
                Hello, I'm
              </motion.p>
              <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Manobala<span className="hero-title-accent"> S</span>
              </motion.h1>
              <motion.h2
                className="hero-subtitle"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
              >
                Aspiring Software Engineer
              </motion.h2>
              <motion.p
                className="hero-description"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.42 }}
              >
                I'm an Integrated M.Tech Software Engineering student at VIT Vellore (CGPA 8.4, batch 2027),
                building modern web applications with React, JavaScript, and strong fundamentals in software engineering.
              </motion.p>
              <motion.div
                className="hero-buttons"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.52 }}
              >
                <a href="https://drive.google.com/file/d/1B0HVAnI4L3NdmkFU4xEfrdl2oFekNOgW/view?usp=share_link" className="btn btn-primary" target="_blank" rel="noreferrer">
                  Download Resume
                </a>
                <Link to="/contact" className="btn btn-ghost">Contact Me</Link>
              </motion.div>
              <motion.div
                className="hero-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.64 }}
              >
                <span>📍 Gudiyatham, Vellore – 632602</span>
                <span>📞 9626488199</span>
                <span>📧 shankarmanogym@gmail.com</span>
              </motion.div>
            </motion.div>

            <TiltCard
              className="hero-card"
              intensity={7}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              style={{ y: smoothCardY }}
            >
              <div>
                <p className="hero-card-heading">Currently</p>
                <p className="hero-card-text">
                  Integrated M.Tech in Software Engineering<br />
                  <span className="hero-highlight">VIT Vellore • CGPA: 8.4 • Graduation: 2027</span>
                </p>
                <p className="hero-card-heading">GitHub</p>
                <a href="https://github.com/Mano-8055" target="_blank" rel="noreferrer" className="hero-link">
                  github.com/Mano-8055
                </a>
              </div>
            </TiltCard>

          </div>
        </motion.div>
      </motion.section>

      {/* ── STATS BAR ── */}
      <Reveal3D delay={0.05}>
        <div className="stats-bar">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="stat-item"
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1, type: "spring", stiffness: 220, damping: 18 }}
            >
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </Reveal3D>

      {/* ── WHAT I DO ── */}
      <section className="home-section-block">
        <Reveal3D>
          <h2 className="section-title gradient-text">What I Do</h2>
          <p className="section-subtitle">Areas I focus on and enjoy building in.</p>
        </Reveal3D>
        <div className="services-grid">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.07} direction={i % 2 === 0 ? "left" : "right"}>
              <TiltCard className="card service-card" intensity={9}>
                <span className="service-icon">{s.icon}</span>
                <h3 className="card-title">{s.title}</h3>
                <p className="card-desc">{s.desc}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TECH STACK MARQUEE ── */}
      <Reveal3D delay={0.05}>
        <section className="home-section-block">
          <h2 className="section-title gradient-text">Tech Stack</h2>
          <div className="marquee-wrapper">
            <motion.div
              className="marquee-track"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              {[...stack, ...stack].map((tech, i) => (
                <span key={i} className="marquee-chip">{tech}</span>
              ))}
            </motion.div>
          </div>
        </section>
      </Reveal3D>

      {/* ── JOURNEY ── */}
      <JourneySection timeline={timeline} />

    </div>
  );
}

/* ---------------- PROJECTS ---------------- */
function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          "https://api.github.com/users/Mano-8055/repos?sort=created&direction=desc"
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data = await res.json();
        const cleaned = data.filter(r => !r.fork).filter(r => !r.archived).slice(0, 9);
        setRepos(cleaned);
      } catch {
        setError("Unable to load projects from GitHub right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, []);

  return (
    <motion.section className="section" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="section-title gradient-text">Projects</h2>
      <p className="section-subtitle">Latest repositories from my GitHub. New projects you see here are pulled automatically.</p>
      {loading && <p style={{ marginTop: "1rem" }}>Loading projects...</p>}
      {error && <p style={{ marginTop: "1rem", color: "#f97373" }}>{error}</p>}
      {!loading && !error && (
        <div className="cards-grid">
          {repos.map((repo, index) => (
            <Reveal key={repo.id} delay={index * 0.06} direction={index % 2 === 0 ? "left" : "right"}>
              <TiltCard className="card card-project" intensity={6}>
                <div className={`card-ribbon ribbon-${index % 3}`} />

                <div className="proj-body">
                  <p className="card-tech">{repo.language || "Multiple technologies"}</p>
                  <h3 className="card-title">{repo.name}</h3>
                  <p className="card-desc">{repo.description || "A GitHub project from my portfolio."}</p>
                </div>

                <div className="proj-footer">
                  <ul className="card-list">
                    <li>⭐ {repo.stargazers_count} stars</li>
                    <li>🍴 {repo.forks_count} forks</li>
                    <li>📅 {new Date(repo.created_at).toLocaleDateString()}</li>
                  </ul>
                  <div className="card-buttons">
                    <a href={repo.html_url} target="_blank" rel="noreferrer" className="btn btn-outline">View on GitHub</a>
                    {repo.homepage && (
                      <a href={repo.homepage} target="_blank" rel="noreferrer" className="btn btn-secondary">Live Demo</a>
                    )}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}
    </motion.section>
  );
}

/* ---------------- UI/UX DESIGN ---------------- */
function UIUXDesign() {
  const designProcess = [
    { step: "01", icon: "🔍", title: "Research",   desc: "User interviews, competitive analysis, and defining pain points to ground every design decision in real needs." },
    { step: "02", icon: "✏️", title: "Wireframe",  desc: "Low-fidelity sketches and wireframes to map out information architecture and user flows before committing to visuals." },
    { step: "03", icon: "🔗", title: "Prototype",  desc: "Interactive Figma prototypes that simulate the final product experience for early validation and feedback." },
    { step: "04", icon: "🚀", title: "Deliver",    desc: "Polished, developer-ready design files with components, tokens, spacing, and clear handoff documentation." },
  ];

  const tools = [
    { name: "Figma",           level: 90, color: "#a259ff" },
    { name: "Adobe XD",        level: 68, color: "#ff61f6" },
    { name: "Canva",           level: 85, color: "#00c4cc" },
    { name: "CSS / Animations",level: 88, color: "#6366f1" },
    { name: "Framer",          level: 62, color: "#0055ff" },
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
    { icon: "🎯", title: "Clarity First",        desc: "Every element earns its place. If it doesn't guide the user, it doesn't stay." },
    { icon: "♿", title: "Accessible by Default", desc: "WCAG contrast ratios, keyboard navigation, and inclusive design from the very start." },
    { icon: "⚡", title: "Performance-Aware",     desc: "Designs that account for loading states, skeletons, and real-world network constraints." },
    { icon: "🧩", title: "Component-Driven",      desc: "Building with atomic design so the system scales without losing visual consistency." },
  ];

  return (
    <motion.section className="section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <div className="uiux-page">

        {/* Header */}
        <Reveal3D>
          <h2 className="section-title gradient-text">UI / UX Design</h2>
          <p className="section-subtitle">
            Crafting interfaces that are intuitive, beautiful, and accessible — from first sketch to final pixel.
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
                <TiltCard className="card process-card" intensity={8}>
                  <div className="process-step-num">{p.step}</div>
                  <span className="service-icon">{p.icon}</span>
                  <h4 className="card-title">{p.title}</h4>
                  <p className="card-desc">{p.desc}</p>
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
              <Reveal key={p.title} delay={i * 0.1} direction={i % 2 === 0 ? "left" : "right"}>
                <motion.div
                  className="card uiux-project-card"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <div className="uiux-card-glow" style={{ background: `radial-gradient(circle at 20% 20%, ${p.color}28, transparent 65%)` }} />
                  <div className="uiux-card-top">
                    <span className="uiux-category">{p.category}</span>
                    <span className="uiux-status">{p.status}</span>
                  </div>
                  <h4 className="card-title uiux-project-title">{p.title}</h4>
                  <p className="card-desc">{p.desc}</p>
                  <div className="uiux-tags">
                    {p.tags.map(t => <span key={t} className="uiux-tag" style={{ "--tag-color": p.color }}>{t}</span>)}
                  </div>
                  <div className="uiux-accent-line" style={{ background: `linear-gradient(90deg, ${p.color}, transparent)` }} />
                </motion.div>
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
                    <motion.div
                      className="tool-bar-fill"
                      style={{ background: `linear-gradient(90deg, ${t.color}, ${t.color}99)` }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${t.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.3, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
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
                <TiltCard className="card principle-card" intensity={8}>
                  <span className="principle-icon">{p.icon}</span>
                  <h4 className="card-title">{p.title}</h4>
                  <p className="card-desc">{p.desc}</p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

      </div>
    </motion.section>
  );
}

/* ---------------- SKILLS ---------------- */
function Skills() {
  const skills = [
    { category: "Programming Languages", items: "Python, Java" },
    { category: "Web Development",       items: "HTML, CSS, JavaScript, React, PHP" },
    { category: "Databases",             items: "MySQL, MongoDB" },
    { category: "Tools",                 items: "Git, VS Code, Figma" },
    { category: "Soft Skills",           items: "Communication, Teamwork" },
  ];
  return (
    <motion.section className="section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <h2 className="section-title gradient-text">Skills</h2>
      <p className="section-subtitle">A mix of technical and interpersonal skills I use to build and ship software.</p>
      <div className="skills-grid">
        {skills.map((s, i) => (
          <Reveal key={s.category} delay={i * 0.07}>
            <TiltCard className="card card-skill" intensity={8}>
              <h3 className="card-title">{s.category}</h3>
              <p className="skill-items">{s.items}</p>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </motion.section>
  );
}

/* ---------------- CERTIFICATIONS ---------------- */
function Certifications() {
  return (
    <motion.section className="section" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45 }}>
      <h2 className="section-title gradient-text">Certifications</h2>
      <Reveal delay={0.05}>
        <div className="card card-cert">
          <h3 className="card-title">Fundamentals of Deep Learning – NVIDIA</h3>
          <p className="card-desc">Issued: September 22, 2025</p>
          <p className="card-desc">Certification IDs: TOt4sbDURj-z5dlIvsIlNQ / 1tO0Ys3ITkGJkXM3sgBKrQ</p>
          <a className="card-link" href="https://drive.google.com/file/d/179mDybl6HvDQ857jLs_Usb1ZiGevphRA/view?usp=drivesdk" target="_blank" rel="noreferrer">View Certificate</a>
        </div>
      </Reveal>
      <Reveal delay={0.12}>
        <div className="card card-cert">
          <h3 className="card-title">Learn React – SCRIMBA</h3>
          <p className="card-desc">Issued: February 04, 2026</p>
          <p className="card-desc">Certification IDs: VTLO18RT2L44</p>
          <a className="card-link" href="https://drive.google.com/file/d/1DUIXY6gv35V4ttmdETDOSv7lE3_ir5hx/view?usp=drivesdk" target="_blank" rel="noreferrer">View Certificate</a>
        </div>
      </Reveal>
    </motion.section>
  );
}

/* ---------------- CONTACT ---------------- */
function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    emailjs.sendForm("service_jh1mgvn", "template_xy8ra8e", e.target, "crw0OW6hsz2xKetZA")
      .then(() => { alert("Message sent successfully! ✅"); e.target.reset(); },
            () => { alert("Something went wrong. Please try again ❌"); });
  };

  return (
    <motion.section className="section" id="contact-cta" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h2 className="section-title gradient-text">Contact</h2>
      <p className="section-subtitle">Got an opportunity, idea, or collaboration in mind? Drop a message.</p>
      <div className="contact-grid">
        <Reveal direction="left">
          <div className="contact-card">
            <h3 className="card-title">Let's Talk</h3>
            <p className="card-desc">I'm open to software engineering internships, freelance web projects, and collaborations on interesting tech ideas.</p>
            <ul className="contact-info">
              <li>📧 <a href="mailto:shankarmanogym@gmail.com">shankarmanogym@gmail.com</a></li>
              <li>📞 9626488199</li>
              <li>📍 Gudiyatham, Vellore – 632602</li>
              <li>🐙 <a href="https://github.com/Mano-8055" target="_blank" rel="noreferrer">github.com/Mano-8055</a></li>
            </ul>
          </div>
        </Reveal>
        <Reveal direction="right">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input name="user_name" type="text" placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="user_email" type="email" placeholder="Your email" required />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" rows="4" placeholder="Type your message..." required />
            </div>
            <button type="submit" className="btn btn-primary btn-full">Send Message</button>
          </form>
        </Reveal>
      </div>
    </motion.section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Manobala S</span>
      <span className="footer-divider">•</span>
      <span>Built with React & Framer Motion</span>
    </footer>
  );
}

export default App;
