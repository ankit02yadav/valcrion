import React, { useState } from "react";
import { Linkedin, Instagram, Globe, Send, CheckCircle } from "lucide-react";
import { COMPANY, SOCIAL } from "../constants";
import { ContactDB } from "../db";
import "./About.css";

export default function About() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError("Please fill in all required fields."); return; }
    setLoading(true);
    try {
      await ContactDB.submit(form);
      setLoading(false);
      setSubmitted(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to send message. Is the server running?");
    }
  };

  return (
    <main className="about page">
      <div className="about__orb about__orb--1" />
      <div className="about__orb about__orb--2" />

      <div className="container">

        {/* Hero */}
        <div className="about__hero">
          <div className="section-label">About Valcrion</div>
          <h1 className="display-xl animate-fade-up">
            We built the platform<br />
            <span className="gradient-text">we always wanted.</span>
          </h1>
        </div>

        {/* Mission */}
        <div className="about__mission glass">
          <div className="about__mission-left">
            <h2 className="display-md">Our Mission</h2>
            <p>{COMPANY.description}</p>
            <p style={{ marginTop: 12, color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
              We built Valcrion because the traditional freelancing model is broken. Too much time wasted on interviews, negotiations, and personality clashes. What matters is the work — and that's all Valcrion is about.
            </p>
          </div>
          <div className="about__mission-right">
            <div className="about__mission-stat">
              <span className="about__mission-num gradient-text">100%</span>
              <span className="about__mission-label">Anonymous by design</span>
            </div>
            <div className="about__mission-stat">
              <span className="about__mission-num gradient-text">4</span>
              <span className="about__mission-label">Service tiers</span>
            </div>
            <div className="about__mission-stat">
              <span className="about__mission-num gradient-text">0</span>
              <span className="about__mission-label">Phone calls needed</span>
            </div>
          </div>
        </div>

        {/* Social / Connect */}
        <div className="about__connect">
          <div className="section-label">Connect</div>
          <h2 className="display-md" style={{ marginBottom: 8 }}>Find us online</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32, fontSize: "0.9rem" }}>
            We're active on social media. Feel free to reach out.
          </p>
          <div className="about__social-grid">
            <a
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noreferrer"
              className="about__social-card skeu-card"
            >
              <Linkedin size={28} style={{ color: "#0a66c2" }} />
              <div>
                <div className="about__social-platform">LinkedIn</div>
                <div className="about__social-handle">{SOCIAL.linkedinHandle}</div>
              </div>
            </a>
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="about__social-card skeu-card"
            >
              <Instagram size={28} style={{ color: "#e1306c" }} />
              <div>
                <div className="about__social-platform">Instagram</div>
                <div className="about__social-handle">{SOCIAL.instagramHandle}</div>
              </div>
            </a>
            <a
              href={SOCIAL.website}
              target={SOCIAL.website === "/" ? "_self" : "_blank"}
              rel="noreferrer"
              className="about__social-card skeu-card"
            >
              <Globe size={28} style={{ color: "var(--accent)" }} />
              <div>
                <div className="about__social-platform">Website</div>
                <div className="about__social-handle">{SOCIAL.websiteHandle}</div>
              </div>
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="section about__contact">
          <div className="section-label">Contact</div>
          <h2 className="display-md" style={{ marginBottom: 8 }}>Get in touch</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 40, fontSize: "0.9rem" }}>
            Have a question? We store every message and personally read them. No auto-replies.
          </p>

          {submitted ? (
            <div className="about__contact-success glass">
              <CheckCircle size={40} style={{ color: "var(--success)" }} />
              <h3>Message received!</h3>
              <p>We've stored your message and will read it soon. Thanks for reaching out.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="about__form glass">
              {error && <div className="auth__error">{error}</div>}
              <div className="about__form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input name="name" type="text" className="form-input" value={form.name} onChange={handle} placeholder="Your name" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" className="form-input" value={form.email} onChange={handle} placeholder="your@email.com" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input name="subject" type="text" className="form-input" value={form.subject} onChange={handle} placeholder="What's this about?" />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea name="message" className="form-input" rows={6} value={form.message} onChange={handle} placeholder="Tell us what's on your mind..." required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={loading}>
                {loading ? <span className="spinner" /> : <><Send size={15} /> Send Message</>}
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  );
}
