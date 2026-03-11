import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Star,
  Shield,
  MessageSquare,
  Zap,
  Users,
  Code,
  Lock,
  CheckCircle,
} from "lucide-react";
import { ROUTES, PRICING } from "../constants";
import { ReviewDB } from "../db";
import type { Review } from "../types";
import "./Home.css";

const FEATURES = [
  {
    icon: <Shield size={22} />,
    title: "100% Anonymous",
    desc: "Clients and developers never know each other's identity until the platform reveals. No bias. Pure work.",
  },
  {
    icon: <MessageSquare size={22} />,
    title: "Chat Only",
    desc: "No calls. No meetings. All communication happens through our built-in secure chat system.",
  },
  {
    icon: <Zap size={22} />,
    title: "Fast Matching",
    desc: "Submit your project and our CRM auto-routes it to the best available developer for your needs.",
  },
  {
    icon: <Lock size={22} />,
    title: "Secure & Private",
    desc: "All data, files, and conversations are encrypted and stored securely. Your ideas stay yours.",
  },
  {
    icon: <Code size={22} />,
    title: "Elite Developers",
    desc: "Every developer is manually vetted by our team. No random freelancers — only trusted builders.",
  },
  {
    icon: <Users size={22} />,
    title: "CRM-Powered",
    desc: "Our internal CRM manages the entire project lifecycle so nothing falls through the cracks.",
  },
];

const HOW_IT_WORKS = [
  { step: 1, title: "Register & choose a plan", desc: "Sign up as a client and pick the pricing tier that fits your project scope." },
  { step: 2, title: "Submit your project", desc: "Upload your brief, references, and documents to your profile dashboard." },
  { step: 3, title: "We assign a developer", desc: "Our system finds the best-fit developer and assigns your project — anonymously." },
  { step: 4, title: "Chat & iterate", desc: "Communicate via our secure chat. Share files, give feedback, track progress." },
  { step: 5, title: "Deliver & review", desc: "Receive your completed project and approve it before the case closes." },
];

const PLANS = Object.entries(PRICING);

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    ReviewDB.getAll().then(setReviews).catch(() => {});
  }, []);
  return (
    <main className="home page">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />

        <div className="container hero__content">
          <div className="hero__badge animate-fade-up">
            <span className="hero__badge-dot" />
            Now live — anonymous freelancing, reimagined
          </div>

          <h1 className="hero__title animate-fade-up delay-100">
            Build the web.<br />
            <span className="gradient-text">Stay anonymous.</span>
          </h1>

          <p className="hero__subtitle animate-fade-up delay-200">
            Valcrion is a closed platform where clients get websites built and developers get paid — without either side ever knowing who's on the other end. Pure focus. Zero distractions.
          </p>

          <div className="hero__cta animate-fade-up delay-300">
            <Link to={ROUTES.register} className="btn btn-primary btn-lg animate-pulse-glow">
              Start a Project <ArrowRight size={18} />
            </Link>
            <Link to={ROUTES.job} className="btn btn-outline btn-lg">
              Join as Developer
            </Link>
          </div>

          <div className="hero__stats animate-fade-up delay-400">
            <div className="hero__stat">
              <span className="hero__stat-num">100%</span>
              <span className="hero__stat-label">Anonymous</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">4</span>
              <span className="hero__stat-label">Project Tiers</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">∞</span>
              <span className="hero__stat-label">Possibilities</span>
            </div>
          </div>
        </div>

        {/* Hero card mockup */}
        <div className="container">
          <div className="hero__mockup animate-float">
            <div className="hero__mockup-header">
              <div className="hero__mockup-dot" style={{ background: "#f87171" }} />
              <div className="hero__mockup-dot" style={{ background: "#fbbf24" }} />
              <div className="hero__mockup-dot" style={{ background: "#4ade80" }} />
              <span className="hero__mockup-url">valcrion.com/profile</span>
            </div>
            <div className="hero__mockup-body">
              <div className="hero__mockup-msg hero__mockup-msg--client">
                <span className="hero__mockup-role">Client</span>
                <p>Hi, I need a full stack e-commerce site with payment integration.</p>
              </div>
              <div className="hero__mockup-msg hero__mockup-msg--dev">
                <span className="hero__mockup-role">Developer ✦</span>
                <p>Got it. I'll start with the architecture. Can you upload your brand assets?</p>
              </div>
              <div className="hero__mockup-msg hero__mockup-msg--client">
                <span className="hero__mockup-role">Client</span>
                <p>Uploading now 📎 brand-kit.zip</p>
              </div>
              <div className="hero__mockup-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-label">Why Valcrion</div>
          <h2 className="section-title display-lg">
            Everything you need.<br />
            <span className="gradient-text">Nothing you don't.</span>
          </h2>

          <div className="grid-3 home__features">
            {FEATURES.map((f, i) => (
              <div key={i} className="skeu-card home__feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="home__feature-icon">{f.icon}</div>
                <h3 className="home__feature-title">{f.title}</h3>
                <p className="home__feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section home__how">
        <div className="home__how-orb" />
        <div className="container">
          <div className="section-label">The Process</div>
          <h2 className="section-title display-lg">
            <span className="gradient-text">Simple.</span> Powerful. Proven.
          </h2>

          <div className="home__steps">
            {HOW_IT_WORKS.map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="home__step glass">
                  <div className="step-num">{s.step}</div>
                  <div>
                    <h4 className="home__step-title">{s.title}</h4>
                    <p className="home__step-desc">{s.desc}</p>
                  </div>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="home__step-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M12 19l-5-5M12 19l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ── */}
      <section className="section">
        <div className="container">
          <div className="section-label">Pricing</div>
          <h2 className="section-title display-lg">
            Pick a plan.<br />
            <span className="gradient-text">We handle the rest.</span>
          </h2>
          <p className="section-sub">Pricing is project-based. Choose the tier that matches what you need built.</p>

          <div className="grid-4 home__plans">
            {PLANS.map(([key, plan], i) => (
              <div
                key={key}
                className={`skeu-card home__plan-card ${i === 2 ? "home__plan-card--featured" : ""}`}
              >
                {i === 2 && <div className="home__plan-popular">Most Popular</div>}
                <h3 className="home__plan-name">{plan.label}</h3>
                <div className="home__plan-price">{plan.price}</div>
                <p className="home__plan-desc">{plan.description}</p>
                <ul className="home__plan-features">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="home__plan-feature">
                      <CheckCircle size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={ROUTES.register}
                  className={`btn btn-sm ${i === 2 ? "btn-primary" : "btn-ghost"}`}
                  style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="section-sm">
        <div className="container">
          <div className="home__cta-banner glass-elevated">
            <div className="home__cta-orb" />
            <Star size={32} style={{ color: "var(--accent)", marginBottom: 12 }} />
            <h2 className="display-md" style={{ textAlign: "center" }}>
              Ready to build something <span className="gradient-text">incredible?</span>
            </h2>
            <p className="home__cta-sub">
              Join Valcrion today and let's get your project shipped — anonymously, efficiently, and professionally.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <Link to={ROUTES.register} className="btn btn-primary btn-lg">
                Start Building <ArrowRight size={18} />
              </Link>
              <Link to={ROUTES.about} className="btn btn-outline btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      {reviews.length > 0 && (
        <section className="section home__reviews">
          <div className="home__reviews-orb" />
          <div className="container">
            <div className="section-label" style={{ margin: "0 auto 16px", width: "fit-content" }}>What Clients Say</div>
            <h2 className="section-title display-lg" style={{ textAlign: "center", marginBottom: 8 }}>
              Real results, <span className="gradient-text">real people.</span>
            </h2>
            <p className="section-sub" style={{ textAlign: "center", marginBottom: 48 }}>Every review is verified by our team before it goes live.</p>
            <div className="home__reviews-grid">
              {reviews.map(r => (
                <div key={r.id} className="skeu-card home__review-card">
                  <div style={{ display: "flex", gap: 3, marginBottom: 12 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={16} fill={s <= r.rating ? "#f59e0b" : "none"} stroke={s <= r.rating ? "#f59e0b" : "var(--text-muted)"} />
                    ))}
                  </div>
                  <p className="home__review-text">"{r.text}"</p>
                  <div className="home__review-author">
                    <div className="home__review-avatar">{r.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="home__review-name">{r.name}</div>
                      <div className="home__review-role">{r.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
