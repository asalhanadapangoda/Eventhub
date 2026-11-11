import React from 'react';
import traceLogo from '../assets/trace-logo.png';

export default function Footer({ setActiveTab }) {
  const handleNavClick = (tabName, e) => {
    if (setActiveTab) {
      e.preventDefault();
      setActiveTab(tabName);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand & Summary Column */}
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <img src={traceLogo} alt="TRACE SPACES" className="trace-logo-img" />
          </div>
          <p className="footer-desc">
            Sri Lanka’s premier technology & innovation hub. Fostering tech entrepreneurs, innovation events, and world-class developer communities.
          </p>
        </div>

        {/* Contact Column matching reference screenshot */}
        <div className="footer-contact">
          <h4 className="footer-section-title">CONTACT</h4>
          <div className="footer-contact-info">
            <div className="contact-name">TRACE Expert City</div>
            <p>Maradana,</p>
            <p>Colombo 10.</p>
            <p style={{ marginTop: '0.75rem' }}>
              <a href="tel:+94701800786">+94 701 800 786</a> | <a href="tel:+94753637293">+94 753 637 293</a>
            </p>
            <p style={{ marginTop: '0.25rem' }}>
              <a href="mailto:connect@trace.lk">connect@trace.lk</a>
            </p>
          </div>
        </div>

        {/* Quick Links Column */}
        <div className="footer-links-col">
          <h4 className="footer-section-title">QUICK LINKS</h4>
          <ul className="footer-nav-list">
            <li>
              <a href="/spaces" onClick={(e) => handleNavClick('venues', e)}>Explore Spaces</a>
            </li>
            <li>
              <a href="/upcoming" onClick={(e) => handleNavClick('upcoming', e)}>Upcoming Events</a>
            </li>
            <li>
              <a href="/past" onClick={(e) => handleNavClick('past', e)}>Past Events Archive</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Social Icons Row & Bottom Bar matching reference screenshot */}
      <div className="footer-bottom-wrapper" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="footer-social-row">
          <span className="footer-social-title">Follow Us</span>
          <div className="social-icons-group">
            <a
              href="https://www.facebook.com/TRACE.SL.info"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              title="Official TRACE Sri Lanka Facebook Page"
            >
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a
              href="https://twitter.com/trace_srilanka"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              title="Official TRACE Sri Lanka Twitter Page"
            >
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a
              href="https://www.instagram.com/trace_srilanka/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              title="Official TRACE Sri Lanka Instagram Profile"
            >
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a
              href="https://www.linkedin.com/company/trace-srilanka/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon-btn"
              title="Official TRACE Sri Lanka LinkedIn Company Page"
            >
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} TRACE Sri Lanka. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

