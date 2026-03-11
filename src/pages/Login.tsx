import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../constants";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || ROUTES.profile;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    const ok = await login(form.email, form.password);
    setLoading(false);
    if (ok) {
      navigate(from, { replace: true });
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <main className="auth page">
      <div className="auth__orb auth__orb--1" />
      <div className="auth__orb auth__orb--2" />

      <div className="container auth__container">
        <div className="auth__card glass-elevated">
          <div className="auth__header">
            <div className="auth__logo">V</div>
            <h1 className="auth__title">Welcome back</h1>
            <p className="auth__sub">Sign in to your Valcrion account</p>
          </div>

          {error && (
            <div className="auth__error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="auth__form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                autoComplete="email"
              />
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
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth__pwd-toggle"
                  onClick={() => setShowPwd(!showPwd)}
                  aria-label="Toggle password"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? <span className="spinner" /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div className="divider" />

          <p className="auth__footer-text">
            New to Valcrion?{" "}
            <Link to={ROUTES.register} className="auth__link">Create an account</Link>
          </p>
          <p className="auth__footer-text" style={{ marginTop: 8 }}>
            Are you a developer?{" "}
            <Link to={ROUTES.job} className="auth__link">Apply here instead</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
