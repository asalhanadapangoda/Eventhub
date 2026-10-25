import React, { useState } from 'react';

export default function WhyJoinSection({ onNavigateSpaces }) {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  return (
    <section className="features-section">
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="features-title" style={{ marginBottom: '0.5rem' }}>
            Why TRACE Events and Spaces?
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
            Empowering Sri Lanka’s technology, startup, and innovation ecosystem through connected regional spaces and world-class events.
          </p>
        </div>

        {/* Split Layout: Sri Lanka Spaces Map on One Side + 3 Key Feature Cards on the Other */}
        <div className="why-trace-split-layout">
          {/* Side 1: Sri Lanka TRACE Spaces Map */}
          <div className="why-trace-map-column">
            <div 
              className="trace-map-card" 
              onClick={() => setIsMapExpanded(true)}
              title="Click to view full map"
            >
              <div className="trace-map-badge-row">
                <span className="trace-network-pill">
                  <i className="fa-solid fa-map-location-dot"></i> ISLAND-WIDE NETWORK
                </span>
                <span className="trace-hubs-count">15+ Innovation Hubs</span>
              </div>

              <div className="trace-map-image-wrapper">
                <img 
                  src="/trace-spaces-map.jpg" 
                  alt="TRACE Spaces Island-Wide Network across Sri Lanka" 
                  className="trace-map-image"
                  loading="lazy"
                />
                <span className="trace-map-zoom-hint">
                  <i className="fa-solid fa-magnifying-glass-plus"></i> Click to Zoom
                </span>
              </div>

              <div className="trace-map-footer">
                <h4 className="trace-map-title">CONNECT &bull; COLLABORATE &bull; INNOVATE</h4>
                <p className="trace-map-subtitle">
                  Colombo &bull; Kandy &bull; Jaffna &bull; Kurunegala &bull; Makandura &bull; Ratnapura &bull; Batticaloa &bull; Southern & Uva
                </p>
              </div>
            </div>
          </div>

          {/* Side 2: 3 High-Impact Feature Boxes */}
          <div className="why-trace-features-column">
            {/* Box 1 */}
            <div className="feature-card feature-card-horizontal">
              <div className="feature-icon icon-indigo">
                <i className="fa-solid fa-people-group"></i>
              </div>
              <div className="feature-card-text">
                <h3 className="feature-heading">Connect with Community</h3>
                <p className="feature-desc">
                  Network with visionary founders, industry mentors, developers, and tech innovators across Sri Lanka's leading community hubs.
                </p>
              </div>
            </div>

            {/* Box 2 */}
            <div className="feature-card feature-card-horizontal">
              <div className="feature-icon icon-teal">
                <i className="fa-solid fa-building-circle-check"></i>
              </div>
              <div className="feature-card-text">
                <h3 className="feature-heading">Access World-Class Facilities</h3>
                <p className="feature-desc">
                  Experience high-speed fiber auditoriums, modern meeting rooms, maker spaces, and creative co-working spaces designed for high performance.
                </p>
              </div>
            </div>

            {/* Box 3 */}
            <div className="feature-card feature-card-horizontal">
              <div className="feature-icon icon-amber">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <div className="feature-card-text">
                <h3 className="feature-heading">Accelerate Career & Startups</h3>
                <p className="feature-desc">
                  Gain hands-on tech exposure, participate in national hackathons, pitch to global investors, and scale innovative startups nationwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Fullscreen Map Modal */}
      {isMapExpanded && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsMapExpanded(false)}
          style={{ zIndex: 9999, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
        >
          <div 
            style={{ maxWidth: '900px', width: '100%', maxHeight: '92vh', background: '#ffffff', borderRadius: '20px', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#eff6ff', color: '#2563eb', fontWeight: 800, fontSize: '0.78rem', padding: '3px 10px', borderRadius: '12px' }}>
                  TRACE SPACES
                </span>
                <strong style={{ color: '#0f172a', fontSize: '1rem' }}>Island-Wide Connected Network</strong>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMapExpanded(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#0f172a' }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div style={{ padding: '1rem', overflowY: 'auto', textAlign: 'center', background: '#fafafa' }}>
              <img 
                src="/trace-spaces-map.jpg" 
                alt="TRACE Spaces Map Full" 
                style={{ maxWidth: '100%', maxHeight: '78vh', objectFit: 'contain', borderRadius: '12px' }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
