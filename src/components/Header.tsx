import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon, LogOut, User, LayoutDashboard } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES, SOCIAL } from "../constants";
import "./Header.css";

const NAV_LINKS = [
  { label: "Home",     href: ROUTES.home },
  { label: "Services", href: ROUTES.services },
  { label: "About",    href: ROUTES.about },
  { label: "Blog",     href: ROUTES.blog },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate(ROUTES.home); };

  const profileRoute =
    user?.role === "admin"
      ? ROUTES.adminPanel
      : user?.role === "developer"
      ? ROUTES.devProfile
      : ROUTES.profile;

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <div className="header__inner container">
        {/* Logo */}
        <Link to={ROUTES.home} className="header__logo">
          <span className="header__logo-icon">V</span>
          <span className="header__logo-text">alcrion</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header__nav">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`header__nav-link ${location.pathname === link.href ? "active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link to={ROUTES.job} className="header__nav-link">
              For Developers
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="header__actions">
          {/* Theme toggle */}
          <button className="header__icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <Link to={profileRoute} className="btn btn-ghost btn-sm">
                {user.role === "admin" ? <LayoutDashboard size={15} /> : <User size={15} />}
                {user.name.split(" ")[0]}
              </Link>
              <button className="header__icon-btn header__icon-btn--danger" onClick={handleLogout} title="Logout" aria-label="Logout">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.login} className="btn btn-ghost btn-sm">Login</Link>
              <Link to={ROUTES.register} className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button className="header__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`header__mobile ${menuOpen ? "header__mobile--open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} to={link.href} className={`header__mobile-link ${location.pathname === link.href ? "active" : ""}`}>
            {link.label}
          </Link>
        ))}
        {!user && (
          <Link to={ROUTES.job} className="header__mobile-link">For Developers</Link>
        )}
        <div className="header__mobile-divider" />
        {user ? (
          <>
            <Link to={profileRoute} className="header__mobile-link">My Profile</Link>
            <button className="header__mobile-link header__mobile-link--danger" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to={ROUTES.login} className="header__mobile-link">Login</Link>
            <Link to={ROUTES.register} className="header__mobile-link header__mobile-link--accent">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
