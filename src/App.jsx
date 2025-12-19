import emailjs from "emailjs-com";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import "./styles.css";




function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.className = darkMode ? "dark-body" : "light-body";
  }, [darkMode]);

  return (
    <Router>
      <div className={`app ${darkMode ? "app-dark" : "app-light"}`}>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

/* ---------------- NAVBAR ---------------- */
function Navbar({ darkMode, setDarkMode }) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="logo">Manobala S</span>
        <span className="role-tag">Software Engineer (Aspiring)</span>
      </div>
      <nav className="navbar-links">
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/projects" className="nav-link">Projects</NavLink>
        <NavLink to="/skills" className="nav-link">Skills</NavLink>
        <NavLink to="/certifications" className="nav-link">Certifications</NavLink>
        <NavLink to="/contact" className="nav-link">Contact</NavLink>
      </nav>
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(prev => !prev)}
        aria-label="Toggle theme"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </header>
  );
}

/* ---------------- HOME / HERO ---------------- */
function Home() {
  return (
    <motion.section
      className="section home-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="hero-grid">
        <div className="hero-text">
          <p className="hero-eyebrow">Hello, I’m</p>
          <h1 className="hero-title">
            Manobala<span className="hero-title-accent"> S</span>
          </h1>
          <h2 className="hero-subtitle">Aspiring Software Engineer</h2>
          <p className="hero-description">
            I’m an Integrated M.Tech Software Engineering student at VIT Vellore (CGPA 8.4, batch 2027),
            building modern web applications with React, JavaScript, and strong fundamentals in software engineering.
          </p>

          <div className="hero-buttons">
            <a
              href="/resume.pdf"
              className="btn btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              Download Resume
            </a>
            <Link to="/contact" className="btn btn-ghost">
              Contact Me
            </Link>
          </div>

          <div className="hero-info">
            <span>📍 Gudiyatham, Vellore – 632602</span>
            <span>📞 9626488199</span>
            <span>📧 shankarmanogym@gmail.com</span>
          </div>
        </div>

        <motion.div
  className="hero-card"
  initial={{ opacity: 0, x: 40 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7 }}
>
  <div>
    <p className="hero-card-heading">Currently</p>
    <p className="hero-card-text">
      Integrated M.Tech in Software Engineering<br />
      <span className="hero-highlight">
        VIT Vellore • CGPA: 8.4 • Graduation: 2027
      </span>
    </p>

    <p className="hero-card-heading">GitHub</p>
    <a
      href="https://github.com/Mano-8055"
      target="_blank"
      rel="noreferrer"
      className="hero-link"
    >
      github.com/Mano-8055
    </a>
  </div>
</motion.div>

      </div>
    </motion.section>
  );
}

/* ---------------- PROJECTS ---------------- */
/* ---------------- PROJECTS (auto from GitHub API) ---------------- */
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

        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status}`);
        }

        const data = await res.json();

        // Filter + shape data
        const cleaned = data
          .filter((repo) => !repo.fork)        // ignore forks
          .filter((repo) => !repo.archived)    // ignore archived
          .slice(0, 9);                        // show latest 9

        setRepos(cleaned);
      } catch (err) {
        console.error("Failed to fetch repos:", err);
        setError("Unable to load projects from GitHub right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  return (
    <motion.section
      className="section"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="section-title gradient-text">Projects</h2>
      <p className="section-subtitle">
        Latest repositories from my GitHub. New projects you see here are pulled automatically.
      </p>

      {loading && <p style={{ marginTop: "1rem" }}>Loading projects...</p>}
      {error && <p style={{ marginTop: "1rem", color: "#f97373" }}>{error}</p>}

      {!loading && !error && (
        <div className="cards-grid">
          {repos.map((repo, index) => (
            <motion.article
              key={repo.id}
              className="card card-project"
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              transition={{ duration: 0.2 }}
            >
              <div className={`card-ribbon ribbon-${index % 3}`}></div>

              <h3 className="card-title">{repo.name}</h3>

              <p className="card-tech">
                {repo.language || "Multiple technologies"}
              </p>

              <p className="card-desc">
                {repo.description ||
                  "A GitHub project from my portfolio. Check the repository for more details."}
              </p>

              <ul className="card-list">
                <li>⭐ Stars: {repo.stargazers_count}</li>
                <li>🍴 Forks: {repo.forks_count}</li>
                <li>📅 Created: {new Date(repo.created_at).toLocaleDateString()}</li>
              </ul>

              <div className="card-buttons">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                >
                  View on GitHub
                </a>

                {repo.homepage && (
                  <a
                    href={repo.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </motion.section>
  );
}


/* ---------------- SKILLS ---------------- */
function Skills() {
  const skills = [
    { category: "Programming Languages", items: "Python, Java" },
    { category: "Web Development", items: "HTML, CSS, JavaScript, React, PHP" },
    { category: "Databases", items: "MySQL, MongoDB" },
    { category: "Tools", items: "Git, VS Code, Figma" },
    { category: "Soft Skills", items: "Communication, Teamwork" }
  ];

  return (
    <motion.section
      className="section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="section-title gradient-text">Skills</h2>
      <p className="section-subtitle">
        A mix of technical and interpersonal skills I use to build and ship software.
      </p>

      <div className="skills-grid">
        {skills.map((s, idx) => (
          <motion.div
            key={s.category}
            className="card card-skill"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.15 }}
          >
            <h3 className="card-title">{s.category}</h3>
            <p className="skill-items">{s.items}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ---------------- CERTIFICATIONS ---------------- */
function Certifications() {
  return (
    <motion.section
      className="section"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="section-title gradient-text">Certifications</h2>
      <div className="card card-cert">
        <h3 className="card-title">Fundamentals of Deep Learning – NVIDIA</h3>
        <p className="card-desc">Issued: September 22, 2025</p>
        <p className="card-desc">
          Certification IDs: TOt4sbDURj-z5dlIvsIlNQ / 1tO0Ys3ITkGJkXM3sgBKrQ
        </p>
      </div>
    </motion.section>
  );
}

/* ---------------- CONTACT (EmailJS-ready) ---------------- */
function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Form submitted");

    emailjs
      .sendForm(
        "service_jh1mgvn",    // 👈 Service ID (string)
        "template_xy8ra8e",   // 👈 Template ID (string)
        e.target,
        "crw0OW6hsz2xKetZA"   // 👈 Public key (string)
      )
      .then(
        (result) => {
          console.log("EmailJS success:", result.text);
          alert("Message sent successfully! ✅");
          e.target.reset();
        },
        (error) => {
          console.error("EmailJS error:", error);
          alert("Something went wrong. Please try again ❌");
        }
      );
  };


  return (
    <motion.section
      className="section"
      id="contact-cta"
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="section-title gradient-text">Contact</h2>
      <p className="section-subtitle">
        Got an opportunity, idea, or collaboration in mind? Drop a message.
      </p>

      <div className="contact-grid">
        <div className="contact-card">
          <h3 className="card-title">Let’s Talk</h3>
          <p className="card-desc">
            I’m open to software engineering internships, freelance web projects, and
            collaborations on interesting tech ideas.
          </p>
          <ul className="contact-info">
            <li>📧 <a href="mailto:shankarmanogym@gmail.com">shankarmanogym@gmail.com</a></li>
            <li>📞 9626488199</li>
            <li>📍 Gudiyatham, Vellore – 632602</li>
            <li>
              🐙 <a href="https://github.com/Mano-8055" target="_blank" rel="noreferrer">
                github.com/Mano-8055
              </a>
            </li>
          </ul>
        </div>

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
          <button type="submit" className="btn btn-primary btn-full">
            Send Message
          </button>
        </form>
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
