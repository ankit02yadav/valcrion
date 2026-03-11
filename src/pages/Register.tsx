import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthDB } from "../db";
import { ROUTES } from "../constants";
import "./Auth.css";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields."); return;
    }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const user = AuthDB.register(form.name, form.email, form.password);
    if (!user) {
      setError("Email already registered. Try logging in.");
      setLoading(false);
      return;
    }
    await login(form.email, form.password);
    setLoading(false);
    navigate(ROUTES.profile, { replace: true });
  };

  const pwdStrength = (p: string) => {
    if (p.length === 0) return 0;
    if (p.length < 6) return 1;
    if (p.length < 10) return 2;
    return 3;
  };

  const strength = pwdStrength(form.password);
  const strengthLabel = ["", "Weak", "Medium", "Strong"][strength];
  const strengthColor = ["", "var(--error)", "var(--warning)", "var(--success)"][strength];

  return (
    <main className="auth page">
      <div className="auth__orb auth__orb--1" />
      <div className="auth__orb auth__orb--2" />

      <div className="container auth__container">
        <div className="auth__card glass-elevated">
          <div className="auth__header">
            <div className="auth__logo">V</div>
            <h1 className="auth__title">Create account</h1>
            <p className="auth__sub">Join Valcrion as a client and start building</p>
          </div>

          {error && (
            <div className="auth__error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="auth__form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" type="text" className="form-input" placeholder="Your name" value={form.name} onChange={handle} autoComplete="name" />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handle} autoComplete="email" />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="auth__pwd-wrap">
                <input
                  name="password"
                  type={showPwd ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handle}
                  autoComplete="new-password"
                />
                <button type="button" className="auth__pwd-toggle" onClick={() => setShowPwd(!showPwd)} aria-label="Toggle password">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="auth__strength">
                  <div className="auth__strength-bars">
                    {[1,2,3].map(i => (
                      <div key={i} className="auth__strength-bar" style={{ background: i <= strength ? strengthColor : "var(--border)" }} />
                    ))}
                  </div>
                  <span style={{ color: strengthColor, fontSize: "0.78rem" }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="auth__pwd-wrap">
                <input
                  name="confirm"
                  type={showPwd ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.confirm}
                  onChange={handle}
                  autoComplete="new-password"
                />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle size={16} style={{ position: "absolute", right: 12, color: "var(--success)" }} />
                )}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? <span className="spinner" /> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <div className="divider" />

          <p className="auth__footer-text">
            Already have an account?{" "}
            <Link to={ROUTES.login} className="auth__link">Sign in</Link>
          </p>
          <p className="auth__footer-text" style={{ marginTop: 8 }}>
            Want to work with us?{" "}
            <Link to={ROUTES.job} className="auth__link">Apply as a developer</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
