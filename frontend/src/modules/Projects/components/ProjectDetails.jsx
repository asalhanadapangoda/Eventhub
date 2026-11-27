import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  BookOpen,
  X,
  Send,
  ExternalLink,
  Quote,
  ImagePlus,
  ZoomIn,
  Calendar,
} from 'lucide-react';
import { DynamicIcon } from './IconMap';

export function ProjectDetails({ project }) {
  const [modalMode, setModalMode] = useState(null); // 'contact' | 'learn' | 'apply' | null
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  });

  if (!project) {
    return (
      <main className="details-page">
        <div className="container">
          <div className="empty-state">
            <h3>Project Not Found</h3>
            <p>We could not find the requested TRACE Sri Lanka initiative.</p>
            <Link to="/projects" className="back-btn">
              <ArrowLeft size={16} />
              <span>Back to Projects</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleOpenContact = () => {
    setSubmitted(false);
    setModalMode('contact');
  };

  const handleOpenLearnMore = () => {
    setModalMode('learn');
  };

  const handleCloseModal = () => {
    setModalMode(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormState({ name: '', email: '', organization: '', message: '' });
  };

  return (
    <main className="details-page">
      <div className="container">
        {/* 1. Back to Projects button */}
        <div className="details-topbar">
          <Link to="/projects" className="back-btn">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Projects</span>
          </Link>

          <div className="details-meta-badges">
            <span className="status-pill blue">{project.statusLabel}</span>
            <span className="status-pill sky">{project.category}</span>
          </div>
        </div>

        {/* 3. Project name and short introduction */}
        <section className="hero-intro-block">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            <span>{project.eyebrow}</span>
          </div>
          <h1 className="hero-title">{project.name}</h1>
          <p className="hero-lead">{project.intro}</p>
        </section>

        {/* 2. Large project banner / hero section */}
        <section
          className={`hero-banner ${project.imageFit === 'contain' ? 'is-contain' : ''}`}
          style={project.imageBg ? { backgroundColor: project.imageBg } : undefined}
          aria-label={`${project.name} banner`}
        >
          <img
            src={project.image}
            alt={project.name}
            className="hero-banner-img"
            style={project.imagePosition ? { objectPosition: project.imagePosition } : undefined}
            loading="eager" decoding="async"
          />
          <div className="hero-banner-scrim" />

          <div className="hero-stats-bar">
            {project.heroStats.map((stat) => (
              <div className="hero-stat-card" key={stat.label}>
                <div className="hero-stat-icon">
                  <DynamicIcon name={stat.icon} size={18} />
                </div>
                <div>
                  <span className="hero-stat-label">{stat.label}</span>
                  <span className="hero-stat-value">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. About the Project section */}
        <section className="detail-section" aria-labelledby="about-heading">
          <div className="about-grid">
            <div>
              <span className="section-label">About the Project</span>
              <h2 id="about-heading" className="section-heading" style={{ marginBottom: 0 }}>
                {project.about.title}
              </h2>
              <div className="about-heading-accent" aria-hidden="true" />
            </div>

            <div className="about-copy">
              {project.about.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              {project.about.applyNow && (
                <div className="about-actions">
                  {project.about.applyNow.url ? (
                    <a
                      href={project.about.applyNow.url}
                      target="_blank"
                      rel="noreferrer"
                      className="apply-now-btn"
                    >
                      <span>{project.about.applyNow.label}</span>
                      <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="apply-now-btn"
                      onClick={() => setModalMode('apply')}
                    >
                      <span>{project.about.applyNow.label}</span>
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Optional Executive Spotlight Section */}
        {project.spotlight && (
          <section className="detail-section" aria-labelledby="spotlight-heading">
            <div className="spotlight-card">
              <div className="spotlight-icon-wrap" aria-hidden="true">
                <Quote size={22} />
              </div>
              <span className="section-label">{project.spotlight.eyebrow}</span>
              <h2 id="spotlight-heading" className="spotlight-title">
                {project.spotlight.title}
              </h2>
              <p className="spotlight-desc">{project.spotlight.description}</p>
              {project.spotlight.secondaryNote && (
                <p className="spotlight-secondary">{project.spotlight.secondaryNote}</p>
              )}
              <div className="spotlight-meta">
                <strong>{project.spotlight.speaker}</strong>
                <span>{project.spotlight.role}</span>
              </div>
            </div>
          </section>
        )}

        {/* Optional Upcoming Events Section */}
        {project.upcomingEvents && (
          <section className="detail-section" aria-labelledby="events-heading">
            <div className="events-header">
              <div>
                <span className="section-label">{project.upcomingEvents.eyebrow}</span>
                <h2 id="events-heading" className="section-heading" style={{ marginBottom: '8px' }}>
                  {project.upcomingEvents.title}
                </h2>
                <p className="events-subtitle">{project.upcomingEvents.subtitle}</p>
              </div>
            </div>

            <div className="events-grid">
              {project.upcomingEvents.items.map((eventItem) => (
                <article className="event-card" key={eventItem.id}>
                  <div className="event-poster-box">
                    {eventItem.poster ? (
                      <img
                        src={eventItem.poster}
                        alt={eventItem.title}
                        className="event-poster-img"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="event-poster-fallback">
                        <Calendar size={24} aria-hidden="true" />
                        <span>{eventItem.badge}</span>
                      </div>
                    )}
                  </div>

                  <div className="event-card-body">
                    <h3 className="event-card-title">{eventItem.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Optional Winners & Photo Gallery Section */}
        {project.gallery && (
          <section className="detail-section" aria-labelledby="gallery-heading">
            <div className="gallery-header">
              <div>
                <span className="section-label">{project.gallery.eyebrow}</span>
                <h2 id="gallery-heading" className="section-heading" style={{ marginBottom: '14px' }}>
                  {project.gallery.title}
                </h2>
              </div>
              {project.gallery.websiteUrl && (
                <a
                  href={project.gallery.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="back-btn"
                >
                  <span>Visit TRACE Sri Lanka</span>
                  <ExternalLink size={15} aria-hidden="true" />
                </a>
              )}
            </div>

            {project.gallery.paragraphs && (
              <div className="gallery-copy">
                {project.gallery.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            <div className="gallery-grid">
              {project.gallery.photos.map((photo, index) =>
                photo.placeholder ? (
                  <div className="gallery-placeholder" key={`placeholder-${index}`}>
                    <div className="gallery-placeholder-icon" aria-hidden="true">
                      <ImagePlus size={24} />
                    </div>
                    <h3 className="gallery-card-title">{photo.title}</h3>
                    <p className="gallery-card-caption">{photo.caption}</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="gallery-card"
                    key={`${photo.title}-${index}`}
                    onClick={() => setLightboxPhoto(photo)}
                    aria-label={`View photo: ${photo.title}`}
                  >
                    <div className="gallery-media">
                      <img src={photo.src} alt={photo.title} className="gallery-img" loading="lazy" decoding="async" />
                      <span className="gallery-zoom-badge" aria-hidden="true">
                        <ZoomIn size={16} />
                      </span>
                    </div>
                    <div className="gallery-card-body">
                      <h3 className="gallery-card-title">{photo.title}</h3>
                      <p className="gallery-card-caption">{photo.caption}</p>
                    </div>
                  </button>
                )
              )}
            </div>
          </section>
        )}

        {/* 5. What We Do section */}
        <section className="detail-section" aria-labelledby="what-we-do-heading">
          <span className="section-label">Strategic Pillars</span>
          <h2 id="what-we-do-heading" className="section-heading">
            What We Do
          </h2>

          <div className="what-we-do-grid">
            {project.whatWeDo.map((pillar, idx) => (
              <article className="pillar-card" key={pillar.title}>
                <div className={`icon-badge ${idx % 2 === 1 ? 'sky' : ''}`}>
                  <DynamicIcon name={pillar.icon} size={22} />
                </div>
                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-desc">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 6. Key Features section with icons */}
        <section className="detail-section" aria-labelledby="features-heading">
          <span className="section-label">Core Capabilities</span>
          <h2 id="features-heading" className="section-heading">
            Key Features
          </h2>

          <div className="features-grid">
            {project.keyFeatures.map((feature, idx) => (
              <article className="feature-card" key={feature.title}>
                <div className={`icon-badge ${idx % 2 === 1 ? 'sky' : ''}`}>
                  <DynamicIcon name={feature.icon} size={20} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 7. Target Audience section */}
        <section className="detail-section" aria-labelledby="audience-heading">
          <span className="section-label">Ecosystem Beneficiaries</span>
          <h2 id="audience-heading" className="section-heading">
            Target Audience
          </h2>

          <div className="audience-grid">
            {project.targetAudience.map((audience) => (
              <article className="audience-card" key={audience.number}>
                <span className="audience-num">{audience.number}</span>
                <h3 className="audience-title">{audience.title}</h3>
                <p className="audience-desc">{audience.description}</p>
                <span className="audience-tag">
                  <span>{audience.tag}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* 8. Contact Us / Learn More section */}
        <section className="cta-banner" aria-labelledby="cta-heading">
          <div className="cta-copy">
            <div className="cta-eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              <span>Partner With TRACE Sri Lanka</span>
            </div>
            <h2 id="cta-heading" className="cta-title">
              {project.cta.title}
            </h2>
            <p className="cta-desc">{project.cta.description}</p>
          </div>

          <div className="cta-actions">
            <button type="button" className="btn-primary" onClick={handleOpenContact}>
              <Mail size={17} aria-hidden="true" />
              <span>Contact Us</span>
            </button>
            <button type="button" className="btn-secondary" onClick={handleOpenLearnMore}>
              <BookOpen size={17} aria-hidden="true" />
              <span>Learn More</span>
            </button>
          </div>
        </section>
      </div>

      {/* Interactive Frontend Modal for Contact Us & Learn More */}
      {modalMode && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={handleCloseModal}
        >
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-label" style={{ marginBottom: '4px' }}>
                  {project.name}
                </span>
                <h3 id="modal-title" style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                  {modalMode === 'contact'
                    ? 'Connect with the Project Team'
                    : modalMode === 'apply'
                      ? `${project.name} Application`
                      : 'Programme Overview'}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {modalMode === 'contact' ? (
              submitted ? (
                <div className="form-success-box">
                  <CheckCircle2
                    size={36}
                    style={{ color: 'var(--trace-blue)', margin: '0 auto 10px' }}
                  />
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>
                    Inquiry Recorded
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Thank you for your interest in <strong>{project.name}</strong>. You can also reach
                    the TRACE Sri Lanka coordination desk directly at{' '}
                    <a
                      href={`mailto:${project.cta.email}`}
                      style={{ color: 'var(--trace-blue)', fontWeight: 600 }}
                    >
                      {project.cta.email}
                    </a>
                    .
                  </p>
                  <button type="button" className="btn-primary" onClick={handleCloseModal}>
                    Done
                  </button>
                </div>
              ) : (
                <form className="inquiry-form" onSubmit={handleFormSubmit}>
                  <div className="form-field">
                    <label htmlFor="inquiry-name">Full Name</label>
                    <input
                      id="inquiry-name"
                      type="text"
                      required
                      placeholder="e.g. Kavindi Perera"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="inquiry-email">Email Address</label>
                    <input
                      id="inquiry-email"
                      type="email"
                      required
                      placeholder="you@organization.lk"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="inquiry-org">Organization / University</label>
                    <input
                      id="inquiry-org"
                      type="text"
                      placeholder="Optional"
                      value={formState.organization}
                      onChange={(e) =>
                        setFormState({ ...formState, organization: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="inquiry-msg">How would you like to engage?</label>
                    <textarea
                      id="inquiry-msg"
                      rows={3}
                      required
                      placeholder={`Tell us about your interest in ${project.name}...`}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                    <Send size={16} aria-hidden="true" />
                    <span>Send Inquiry</span>
                  </button>
                </form>
              )
            ) : modalMode === 'apply' ? (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.68 }}>
                  The application drive link for <strong>{project.name}</strong> will be updated
                  shortly. In the meantime, you can submit your startup pitch details or inquiry
                  directly to our investment desk.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
                  <button type="button" className="btn-primary" onClick={handleOpenContact}>
                    <Mail size={16} aria-hidden="true" />
                    <span>Contact Investment Desk</span>
                  </button>
                  <button type="button" className="back-btn" onClick={handleCloseModal}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                  {project.cta.learnMoreSummary}
                </p>
                <ul className="learn-more-list">
                  {project.cta.highlights.map((item) => (
                    <li key={item}>
                      <CheckCircle2
                        size={18}
                        style={{ color: 'var(--trace-sky)', flexShrink: 0, marginTop: '2px' }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button type="button" className="btn-primary" onClick={handleOpenContact}>
                    <Mail size={16} aria-hidden="true" />
                    <span>Contact Project Team</span>
                  </button>
                  <button
                    type="button"
                    className="back-btn"
                    onClick={handleCloseModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Lightbox Modal for Gallery Photos */}
      {lightboxPhoto && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={lightboxPhoto.title}
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close lightbox-close"
              onClick={() => setLightboxPhoto(null)}
              aria-label="Close image preview"
            >
              <X size={18} />
            </button>
            <img src={lightboxPhoto.src} alt={lightboxPhoto.title} className="lightbox-img" loading="lazy" decoding="async" />
            <div className="lightbox-caption-bar">
              <h3>{lightboxPhoto.title}</h3>
              <p>{lightboxPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

