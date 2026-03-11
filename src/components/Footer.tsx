import React from "react";
import { Link } from "react-router-dom";
import { Linkedin, Instagram, Globe, ExternalLink } from "lucide-react";
import { COMPANY, SOCIAL, ROUTES } from "../constants";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-icon">V</span>
            <span className="footer__logo-name">alcrion</span>
          </div>
          <p className="footer__tagline">{COMPANY.tagline}</p>
          <div className="footer__social">
            <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="footer__social-link" aria-label="LinkedIn">
              <Linkedin size={16} />
            </a>
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="footer__social-link" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href={SOCIAL.website} target="_self" rel="noreferrer" className="footer__social-link" aria-label="Website">
              <Globe size={16} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="footer__links">
          <div className="footer__col">
            <h4 className="footer__col-title">Company</h4>
            <Link to={ROUTES.about} className="footer__link">About Us</Link>
            <Link to={ROUTES.services} className="footer__link">Services</Link>
            <Link to={ROUTES.blog} className="footer__link">Blog</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Developers</h4>
            <Link to={ROUTES.job} className="footer__link">Apply Now</Link>
            <Link to={ROUTES.login} className="footer__link">Dev Login</Link>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Clients</h4>
            <Link to={ROUTES.register} className="footer__link">Get Started</Link>
            <Link to={ROUTES.login} className="footer__link">Login</Link>
            <Link to={ROUTES.services} className="footer__link">Pricing</Link>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">© {year} {COMPANY.name}. All rights reserved.</p>
          <p className="footer__built">Built with 💜 by Valcrion</p>
        </div>
      </div>
    </footer>
  );
}
