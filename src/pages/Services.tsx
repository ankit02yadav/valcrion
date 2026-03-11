import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { PRICING, ROUTES } from "../constants";
import "./Services.css";

const PROCESS = [
  { n: 1, t: "Register & Choose Plan", d: "Create your account and select the service tier that fits your project." },
  { n: 2, t: "Submit Project Brief", d: "Upload details, documents, references — anything that describes your vision." },
  { n: 3, t: "Anonymous Assignment", d: "Our system matches your project to a vetted developer. Neither side knows the other." },
  { n: 4, t: "Build via Chat", d: "Communicate exclusively through our secure in-app chat. No calls, no emails." },
  { n: 5, t: "Review & Deliver", d: "Approve the final deliverable before the project is marked complete." },
];

export default function Services() {
  return (
    <main className="services page">
      <div className="services__orb" />
      <div className="container">
        <div className="services__hero">
          <div className="section-label">What We Build</div>
          <h1 className="display-xl animate-fade-up">
            Services built for <br />
            <span className="gradient-text">serious projects.</span>
          </h1>
          <p className="services__sub animate-fade-up delay-100">
            Every plan includes a dedicated developer, anonymous communication, and full project management through our CRM.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="services__grid">
          {Object.entries(PRICING).map(([key, plan], i) => (
            <div
              key={key}
              className={`services__card skeu-card ${i === 2 ? "services__card--featured" : ""}`}
            >
              {i === 2 && (
                <div className="services__popular">Most Popular</div>
              )}
              <div className="services__card-top">
                <h3 className="services__plan-name">{plan.label}</h3>
                <div className="services__plan-price">{plan.price}</div>
                <p className="services__plan-desc">{plan.description}</p>
              </div>
              <ul className="services__features">
                {plan.features.map((f, fi) => (
                  <li key={fi}>
                    <CheckCircle size={15} style={{ color: "var(--success)", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to={ROUTES.register}
                className={`btn ${i === 2 ? "btn-primary" : "btn-ghost"}`}
                style={{ justifyContent: "center" }}
              >
                Get Started <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>

        {/* Process */}
        <div className="section">
          <div className="section-label">How It Works</div>
          <h2 className="display-lg" style={{ marginBottom: 48 }}>
            From idea to <span className="gradient-text">live website.</span>
          </h2>
          <div className="services__process">
            {PROCESS.map((s, i) => (
              <React.Fragment key={s.n}>
                <div className="services__process-step glass">
                  <div className="step-num">{s.n}</div>
                  <div>
                    <h4 className="services__process-title">{s.t}</h4>
                    <p className="services__process-desc">{s.d}</p>
                  </div>
                </div>
                {i < PROCESS.length - 1 && (
                  <div className="services__process-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M12 19l-5-5M12 19l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="section-sm">
          <div className="section-label">FAQ</div>
          <h2 className="display-md" style={{ marginBottom: 40 }}>Common questions</h2>
          <div className="services__faq">
            {[
              { q: "Will I know who my developer is?", a: "Not unless the platform explicitly reveals it. The entire system is designed for anonymity. This ensures both sides focus purely on the work." },
              { q: "Can I communicate via phone or email?", a: "No. All communication happens within Valcrion's chat system. This keeps everything documented and anonymous." },
              { q: "How is a developer assigned to my project?", a: "Our admin reviews your project and manually assigns the best-fit developer from our vetted pool based on skills and availability." },
              { q: "What if I'm unhappy with the result?", a: "Each plan includes revision rounds. For the Full Detailed plan, unlimited revisions are available within 30 days." },
              { q: "How do I pay?", a: "Payment details are shared after project submission. We accept UPI, bank transfer, and other standard methods." },
            ].map((item, i) => (
              <div key={i} className="skeu-card services__faq-item">
                <h4 className="services__faq-q">{item.q}</h4>
                <p className="services__faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
