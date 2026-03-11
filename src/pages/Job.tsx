import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle, Briefcase, Send, Shield, Clock, Zap, Star,
  ExternalLink, FileText, AlertCircle,
} from "lucide-react";
import { JobDB } from "../db";
import { JOB_LISTING, ROUTES } from "../constants";
import "./Job.css";

export default function Job() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", skills: "",
    experience: "", portfolioUrl: "", githubUrl: "",
    cvUrl: "", coverLetter: "",
  });
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.skills || !form.experience || !form.coverLetter) {
      setError("Please fill in all required fields."); return;
    }
    if (!form.cvUrl) {
      setError("Please provide your CV / Resume link (Google Drive or any public link)."); return;
    }
    setLoading(true);
    try {
      await JobDB.submit({
        name: form.name,
        email: form.email,
        phone: form.phone,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        experience: form.experience,
        portfolioUrl: form.portfolioUrl,
        githubUrl: form.githubUrl,
        cvUrl: form.cvUrl,
        coverLetter: form.coverLetter,
      });
      setLoading(false);
      setSubmitted(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <main className="job page">
      <div className="job__orb job__orb--1" />
      <div className="job__orb job__orb--2" />

      <div className="container">
        {/* Hero */}
        <div className="job__hero">
          <div className="section-label animate-fade-up">We're Hiring</div>
          <h1 className="display-xl animate-fade-up delay-100">
            Build the web.<br />
            <span className="gradient-text">Stay hidden.</span>
          </h1>
          <p className="job__hero-sub animate-fade-up delay-200">
            Join Valcrion's exclusive developer network. Work on real client projects, get paid well, and stay completely anonymous. No meetings. No politics. Just code.
          </p>
        </div>

        <div className="job__layout">
          {/* Left: details */}
          <div className="job__details">
            <div className="skeu-card job__card">
              <div className="job__card-header">
                <Star size={20} style={{ color: "var(--accent)" }} />
                <h3>What you get</h3>
              </div>
              <ul className="job__list">
                {JOB_LISTING.perks.map((p, i) => (
                  <li key={i} className="job__list-item">
                    <CheckCircle size={15} style={{ color: "var(--success)", flexShrink: 0 }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="skeu-card job__card">
              <div className="job__card-header">
                <Briefcase size={20} style={{ color: "var(--accent)" }} />
                <h3>What we expect</h3>
              </div>
              <ul className="job__list">
                {JOB_LISTING.requirements.map((r, i) => (
                  <li key={i} className="job__list-item">
                    <CheckCircle size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="skeu-card job__card">
              <div className="job__card-header">
                <Zap size={20} style={{ color: "var(--accent)" }} />
                <h3>How the process works</h3>
              </div>
              <div className="job__process">
                {[
                  { n: 1, t: "Apply", d: "Fill out the form, share your CV link, and submit." },
                  { n: 2, t: "Manual Review", d: "Ankit personally reviews every application." },
                  { n: 3, t: "Get Added", d: "Approved devs get account access and can log in." },
                  { n: 4, t: "Start Working", d: "Projects get assigned. You build. You get paid." },
                ].map(s => (
                  <div key={s.n} className="job__process-step">
                    <div className="step-num">{s.n}</div>
                    <div>
                      <strong>{s.t}</strong>
                      <p className="job__process-desc">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: CTA or form */}
          <div className="job__right">
            {!showForm && !submitted && (
              <div className="glass-elevated job__cta-card">
                <div className="job__cta-icon"><Shield size={32} /></div>
                <h2>Ready to apply?</h2>
                <p>Applications are reviewed manually. We add developers directly to our database — no automated systems, no randomness.</p>
                <div className="job__cta-badges">
                  <span className="badge badge-purple"><Clock size={12} /> Manual review</span>
                  <span className="badge badge-purple"><Shield size={12} /> Invite only</span>
                </div>
                <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => setShowForm(true)}>
                  Apply Now
                </button>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                  Already approved? <Link to={ROUTES.login} style={{ color: "var(--accent)" }}>Log in here</Link>
                </p>
              </div>
            )}

            {showForm && !submitted && (
              <div className="glass-elevated job__form-card">
                <h3 style={{ marginBottom: 8 }}>Developer Application</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 24 }}>
                  Fill in your details below. All fields marked * are required.
                </p>

                {error && (
                  <div className="auth__error" style={{ marginBottom: 20 }}>
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input name="name" type="text" className="form-input" value={form.name} onChange={handle} placeholder="Your full name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input name="email" type="email" className="form-input" value={form.email} onChange={handle} placeholder="your@email.com" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input name="phone" type="tel" className="form-input" value={form.phone} onChange={handle} placeholder="+91 xxxx xxxxxx" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Skills * <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(comma separated)</span></label>
                    <input name="skills" type="text" className="form-input" value={form.skills} onChange={handle} placeholder="React, Node.js, TypeScript, MongoDB" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Years of Experience *</label>
                    <select name="experience" className="form-input" value={form.experience} onChange={handle} required>
                      <option value="">Select...</option>
                      <option value="0-1">0–1 years (fresher)</option>
                      <option value="1-2">1–2 years</option>
                      <option value="2-4">2–4 years</option>
                      <option value="4+">4+ years</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Portfolio URL</label>
                    <input name="portfolioUrl" type="url" className="form-input" value={form.portfolioUrl} onChange={handle} placeholder="https://yourportfolio.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input name="githubUrl" type="url" className="form-input" value={form.githubUrl} onChange={handle} placeholder="https://github.com/username" />
                  </div>

                  {/* CV / Resume — Drive link */}
                  <div className="form-group">
                    <label className="form-label">CV / Resume Link *</label>
                    <input
                      name="cvUrl"
                      type="url"
                      className="form-input"
                      value={form.cvUrl}
                      onChange={handle}
                      placeholder="https://drive.google.com/file/d/..."
                    />
                    <div className="drive-hint">
                      <div className="drive-hint__icon"><FileText size={14} /></div>
                      <div>
                        <p className="drive-hint__title">How to share your CV via Google Drive</p>
                        <ol className="drive-hint__steps">
                          <li>Upload your CV (PDF) to <a href="https://drive.google.com" target="_blank" rel="noreferrer">Google Drive <ExternalLink size={10} /></a></li>
                          <li>Right-click the file → <strong>Share</strong></li>
                          <li>Change access to <strong>"Anyone with the link"</strong></li>
                          <li>Click <strong>Copy link</strong> and paste it above</li>
                        </ol>
                        <p className="drive-hint__alt">Or use any public link — Notion, Dropbox, OneDrive, etc.</p>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cover Letter / Why us? *</label>
                    <textarea name="coverLetter" className="form-input" rows={5} value={form.coverLetter} onChange={handle} placeholder="Tell us about yourself and why you want to join Valcrion..." required />
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={loading}>
                      {loading ? <span className="spinner" /> : <><Send size={15} /> Submit Application</>}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {submitted && (
              <div className="glass-elevated job__success-card">
                <CheckCircle size={48} style={{ color: "var(--success)" }} />
                <h2>Application received!</h2>
                <p>Ankit will personally review your application. If approved, you'll receive your login credentials.</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 8 }}>
                  No calls. No interviews. We review your work and decide.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
