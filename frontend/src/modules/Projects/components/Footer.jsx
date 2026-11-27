import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Globe,
  X,
} from 'lucide-react';
import traceLogo from '../assets/trace-logo.png';
import { projects } from '../data/projects';

const LEGAL_COPY = {
  privacy: {
    title: 'Privacy Policy',
    body: 'This showcase website presents public information on TRACE Sri Lanka projects and initiatives. Any contact inquiries entered in project modals operate locally in your browser unless you choose to email our coordination desk directly.',
  },
  terms: {
    title: 'Terms of Service',
    body: 'Project descriptions, programme details, and initiative highlights on this portal are provided for informational purposes by TRACE Sri Lanka (Technologically Re-Awakening Culture of Excellence).',
  },
};

export function Footer() {
  const [legalModal, setLegalModal] = useState(null);

  return (
    <>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand & Description */}
            <div className="footer-brand-col">
              <Link to="/projects" className="footer-logo-wrap" aria-label="TRACE Sri Lanka Home">
                <img src={traceLogo} alt="TRACE Sri Lanka" className="footer-logo-img" loading="lazy" decoding="async" />
                <span className="footer-logo-tagline">PROJECTS &amp; INITIATIVES</span>
              </Link>

              <p className="footer-desc">
                Showcasing TRACE Sri Lanka&rsquo;s flagship projects and initiatives&mdash;uniting
                technology parks, startup investment, R&amp;D grants, food-tech labs, university
                incubators, career readiness, and policy advocacy.
              </p>

              <div className="footer-socials" aria-label="TRACE Sri Lanka Social Links">
                <a
                  href="https://www.facebook.com/TRACESriLanka"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-btn"
                  aria-label="TRACE Sri Lanka on Facebook"
                >
                  <Facebook size={16} aria-hidden="true" />
                </a>
                <a
                  href="https://www.instagram.com/tracesrilanka"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-btn"
                  aria-label="TRACE Sri Lanka on Instagram"
                >
                  <Instagram size={16} aria-hidden="true" />
                </a>
                <a
                  href="https://www.linkedin.com/company/trace-sri-lanka"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-btn"
                  aria-label="TRACE Sri Lanka on LinkedIn"
                >
                  <Linkedin size={16} aria-hidden="true" />
                </a>
                <a
                  href="https://tracesrilanka.org"
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-btn"
                  aria-label="TRACE Sri Lanka Website"
                >
                  <Globe size={16} aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Column 2: Our Projects */}
            <div className="footer-col">
              <h3 className="footer-col-heading">OUR PROJECTS</h3>
              <ul className="footer-links-list">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link to={`/projects/${project.slug}`} className="footer-nav-link">
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="footer-col">
              <h3 className="footer-col-heading">CONTACT</h3>
              <ul className="footer-contact-list">
                <li className="footer-contact-item">
                  <MapPin size={17} className="footer-contact-icon" aria-hidden="true" />
                  <div>
                    <strong className="footer-contact-strong">TRACE Expert City</strong>
                    <span>Maradana,</span>
                    <span>Colombo 10.</span>
                  </div>
                </li>
                <li className="footer-contact-item">
                  <Phone size={16} className="footer-contact-icon" aria-hidden="true" />
                  <a href="tel:+94706706791" className="footer-contact-link">
                    +94 70 670 6791
                  </a>
                </li>
                <li className="footer-contact-item">
                  <Mail size={16} className="footer-contact-icon" aria-hidden="true" />
                  <a href="mailto:connect@trace.lk" className="footer-contact-link">
                    connect@trace.lk
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} TRACE Sri Lanka (Technologically Re-Awakening
              Culture of Excellence). All Rights Reserved.
            </p>
            <div className="footer-legal-links">
              <button
                type="button"
                className="footer-legal-btn"
                onClick={() => setLegalModal('privacy')}
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">&bull;</span>
              <button
                type="button"
                className="footer-legal-btn"
                onClick={() => setLegalModal('terms')}
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      {legalModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          onClick={() => setLegalModal(null)}
        >
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-label" style={{ marginBottom: '4px' }}>
                  TRACE Sri Lanka
                </span>
                <h3 id="legal-modal-title" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                  {LEGAL_COPY[legalModal].title}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setLegalModal(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              {LEGAL_COPY[legalModal].body}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

