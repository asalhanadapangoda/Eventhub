import React, { useState, useEffect } from 'react';
import traceLogo from '../assets/trace-logo.png';
import Footer from './Footer';
import FormattedText from './FormattedText';

export default function EventDetailsPage({
  event: initialEvent,
  onBack,
  currentUser,
  onRegistrationSuccess,
  onOpenMyEvents,
  onOpenCalendar,
  showToast,
}) {
  const [activeEvent, setActiveEvent] = useState(initialEvent);
  const [loadingEvent, setLoadingEvent] = useState(!initialEvent);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  useEffect(() => {
    if (initialEvent) {
      setActiveEvent(initialEvent);
      setLoadingEvent(false);
      return;
    }

    const hash = window.location.hash || '';
    const match = hash.match(/[?&]id=([^&]+)/);
    const eventId = match ? match[1] : sessionStorage.getItem('eventhub_details_event_id');

    if (eventId) {
      setLoadingEvent(true);
      fetch(`/api/events/${eventId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setActiveEvent(data.data);
          } else {
            setActiveEvent(null);
          }
        })
        .catch((err) => {
          console.error('Error fetching event details on reload:', err);
          setActiveEvent(null);
        })
        .finally(() => setLoadingEvent(false));
    } else {
      setLoadingEvent(false);
    }
  }, [initialEvent]);

  // Universal YouTube Embed URL generator
  const getYouTubeEmbedUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const clean = url.trim();
    if (!clean) return null;

    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return `https://www.youtube.com/embed/${clean}`;
    }

    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
    const match = clean.match(regExp);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return null;
  };

  // Listen for live updates across components and tabs
  useEffect(() => {
    const handleUpdate = (updated) => {
      if (!updated) return;
      if (updated.deleted) {
        if (activeEvent && String(activeEvent._id || activeEvent.id) === String(updated._id)) {
          if (showToast) showToast('This event was removed.', 'info');
          if (onBack) onBack();
        }
        return;
      }
      if (updated._id) {
        setActiveEvent((prev) => {
          if (prev && String(prev._id || prev.id) === String(updated._id)) {
            return { ...prev, ...updated };
          }
          return prev;
        });
      }
    };

    const handleCustomEvent = (e) => handleUpdate(e.detail);
    window.addEventListener('eventhub_events_updated', handleCustomEvent);

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('eventhub_channel');
        bc.onmessage = (msg) => {
          if (msg.data?.type === 'EVENT_UPDATED') {
            handleUpdate(msg.data.detail);
          }
        };
      } catch (err) { }
    }

    const handleStorage = (e) => {
      if (e.key === 'eventhub_last_event_update' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.detail) handleUpdate(parsed.detail);
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('eventhub_events_updated', handleCustomEvent);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [activeEvent, onBack, showToast]);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.contactNumber || '');
    }
  }, [currentUser]);

  const event = activeEvent;

  if (loadingEvent) {
    return (
      <div className="event-details-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '4rem 1rem' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#5d4df6' }}></i>
        <p style={{ color: '#64748b', fontWeight: '600' }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', padding: '4rem 1rem', textAlign: 'center' }}>
        <i className="fa-regular fa-calendar-xmark" style={{ fontSize: '3rem', color: '#94a3b8' }}></i>
        <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0.5rem 0' }}>Event Not Found</h2>
        <p style={{ color: '#64748b', maxWidth: '400px', marginBottom: '1rem' }}>The event you are looking for does not exist or may have been removed.</p>
        <button className="btn btn-primary" onClick={onBack}>
          <i className="fa-solid fa-arrow-left"></i> Back to Events
        </button>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAddToGoogleCalendar = () => {
    const evt = activeEvent;
    if (!evt) return;
    try {
      const eventDate = new Date(evt.date || Date.now());
      let startHours = 10;
      let startMinutes = 0;

      if (evt.time) {
        const timeMatch = evt.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = parseInt(timeMatch[2], 10);
          const meridiem = timeMatch[3] ? timeMatch[3].toUpperCase() : null;
          if (meridiem === 'PM' && h < 12) h += 12;
          if (meridiem === 'AM' && h === 12) h = 0;
          startHours = h;
          startMinutes = m;
        }
      }

      const start = new Date(eventDate);
      start.setHours(startHours, startMinutes, 0, 0);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

      const pad = (n) => String(n).padStart(2, '0');
      const toUtc = (d) =>
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

      const startUtc = toUtc(start);
      const endUtc = toUtc(end);

      const title = encodeURIComponent(evt.title || 'TRACE Event');
      const location = encodeURIComponent(evt.location || 'TRACE Expert City, Colombo');
      const details = encodeURIComponent(
        `Registered Event on TRACE Event Hub\nTicket: ${registrationData?.ticketId || 'CONFIRMED'}\nTime: ${evt.time || '10:00 AM'}\nLocation: ${evt.location || 'TRACE Expert City'}\n\nOrganized by TRACE Expert City.`
      );

      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;

      window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
      if (showToast) showToast('Opening Google Calendar...', 'success');
    } catch (e) {
      if (onOpenCalendar) onOpenCalendar();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreed) {
      showToast('Please agree to the Terms of Service and Privacy Policy.', 'error');
      return;
    }

    const phoneRegex = /^\+?[0-9\s-]{9,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      showToast('Please enter a valid contact phone number (e.g., +94 77 123 4567).', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event._id,
          name,
          email,
          contactNumber: phone,
          notes: message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsRegistered(true);
        setRegistrationData(result.data);
        showToast('Registration successful!', 'success');
        if (onRegistrationSuccess) {
          onRegistrationSuccess(result.data);
        }
      } else {
        showToast(result.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      showToast('Network error during registration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadIcs = () => {
    const eventDate = new Date(event.date || Date.now());
    const formatDateForIcs = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const startDateStr = formatDateForIcs(eventDate);
    const endDateStr = formatDateForIcs(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000));
    const ticketId = registrationData?.registration?.ticketId || 'TICKET-' + Date.now();

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TRACE Event Hub//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${ticketId}@trace.lk`,
      `DTSTAMP:${formatDateForIcs(new Date())}`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, ' ')} | Ticket: ${ticketId}`,
      `LOCATION:${event.location}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: 1 Day until ${event.title}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${(event.title || 'Event').replace(/\s+/g, '_')}_Reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) {
      showToast('Downloaded Calendar Invite (.ics)', 'success');
    }
  };

  // Extract all uploaded gallery/images for event so side photos use uploaded images
  const galleryList = Array.isArray(event.gallery)
    ? event.gallery.map((g) => (typeof g === 'string' ? g : g.url)).filter(Boolean)
    : (Array.isArray(event.images) ? event.images.filter(Boolean) : []);

  const hasUploadedCover = Boolean(event.coverImage);
  const uploadedPhotos = galleryList.length > 0
    ? galleryList
    : (hasUploadedCover ? [event.coverImage] : []);

  const imgMain =
    uploadedPhotos[0] ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
  const imgTopRight =
    uploadedPhotos[1] ||
    (hasUploadedCover ? uploadedPhotos[0] : 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80');
  const imgBottomRight =
    uploadedPhotos[2] ||
    uploadedPhotos[1] ||
    (hasUploadedCover ? uploadedPhotos[0] : 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80');

  return (
    <div className="event-details-page">
      {/* Top Bar Header matching screenshot */}
      <header className="details-header">
        <div className="details-header-container">
          <div className="brand-logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={traceLogo} alt="TRACE SPACES" className="trace-logo-img" />
          </div>
          <button className="btn-back-link" onClick={onBack}>
            <i className="fa-solid fa-arrow-left"></i> Back to Events
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="details-main-content">
        <div className="details-container">
          {/* If Registration Successful, render the exact confirmation view matching screenshot */}
          {isRegistered ? (
            <div className="success-page-container">
              <div className="success-card-box">
                {/* Top Teal Check Circle */}
                <div className="success-check-badge">
                  <i className="fa-solid fa-check"></i>
                </div>

                <h1 className="success-title">Registration Successful!</h1>
                <p className="success-subtitle">You are successfully registered for this event.</p>

                {/* Event Summary Card */}
                <div className="success-event-summary">
                  <img src={imgMain} alt={event.title} className="summary-thumb" />
                  <div className="summary-details">
                    <h3 className="summary-event-title">{event.title}</h3>
                    <div className="summary-meta-item">
                      <i className="fa-regular fa-calendar"></i>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="summary-meta-item">
                      <i className="fa-regular fa-clock"></i>
                      <span>{event.time || '10:00 AM - 1:00 PM'}</span>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || 'TRACE Expert City')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="summary-meta-item"
                      title="Click to open location on Google Maps"
                      style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                    >
                      <i className="fa-solid fa-location-dot" style={{ color: '#5d4df6' }}></i>
                      <span style={{ textDecoration: 'underline', color: '#5d4df6', fontWeight: '600' }}>{event.location || 'TRACE Expert City'}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.68rem', color: '#5d4df6', marginLeft: '2px' }}></i>
                    </a>
                  </div>
                </div>

                {/* Reminder Notification Info Banner */}
                <div className="reminder-info-banner">
                  <i className="fa-solid fa-circle-info info-icon"></i>
                  <span>You will receive a reminder notification one day before the event.</span>
                </div>

                {/* Action Buttons Row matching screenshot */}
                <div className="success-actions-row">
                  <button
                    className="btn-add-calendar-blue"
                    onClick={handleAddToGoogleCalendar}
                    title="Save event directly to your Google Calendar"
                  >
                    <i className="fa-brands fa-google"></i> Add to Calendar
                  </button>
                  <button className="btn-view-my-events-outline" onClick={onOpenMyEvents}>
                    View My Events
                  </button>
                  <button className="btn-back-events-link" onClick={onBack}>
                    Back to Events
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form View */
            <div className="details-grid-layout">
              {/* Left Column: Media Collage & Event Info */}
              <div className="details-left-column">
                <div className={`media-collage-grid ${uploadedPhotos.length === 1 ? 'single-photo-mode' : ''}`}>
                  <div className="collage-main-photo">
                    <div className="collage-photo-backdrop" style={{ backgroundImage: `url(${imgMain})` }} />
                    <img className="collage-main-img" src={imgMain} alt={event.title} />
                    <span className="free-event-badge">FREE EVENT</span>
                  </div>
                  {uploadedPhotos.length > 1 && (
                    <div className="collage-side-photos">
                      {uploadedPhotos[1] && (
                        <div className="side-photo-top">
                          <img src={uploadedPhotos[1]} alt="Event photo 2" />
                        </div>
                      )}
                      {uploadedPhotos[2] && (
                        <div className="side-photo-bottom">
                          <img src={uploadedPhotos[2]} alt="Event photo 3" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="event-info-box">
                  {/* Category Badge & Seats Remaining Pill */}
                  <div className="details-tags-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span className="event-category-badge">
                      {(event.category || 'WORKSHOP').toUpperCase()}
                    </span>

                    <span className="seats-left-pill">
                      <i className="fa-solid fa-chair"></i>{' '}
                      {Math.max(0, (event.capacity || 100) - (event.registeredCount || 0))} Seats Remaining
                    </span>
                  </div>

                  <h1 className="details-event-title">{event.title}</h1>

                  {/* Short Excerpt Summary Box */}
                  {event.shortDescription && (
                    <div className="event-excerpt-callout">
                      <i className="fa-solid fa-quote-left quote-icon"></i>
                      <p>{event.shortDescription}</p>
                    </div>
                  )}

                  <FormattedText content={event.description} className="details-event-description" />

                  <div className="event-meta-row">
                    <div className="meta-item">
                      <div className="meta-icon-wrapper">
                        <i className="fa-regular fa-calendar"></i>
                      </div>
                      <div className="meta-text">
                        <span className="meta-label">DATE</span>
                        <span className="meta-value">{formatDate(event.date)}</span>
                      </div>
                    </div>

                    <div className="meta-item">
                      <div className="meta-icon-wrapper">
                        <i className="fa-regular fa-clock"></i>
                      </div>
                      <div className="meta-text">
                        <span className="meta-label">TIME</span>
                        <span className="meta-value">{event.time || '10:00 AM - 1:00 PM'}</span>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || 'TRACE Expert City')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meta-item location-map-link"
                      title="Click to view location pin on Google Maps"
                      style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                    >
                      <div className="meta-icon-wrapper">
                        <i className="fa-solid fa-location-dot"></i>
                      </div>
                      <div className="meta-text">
                        <span className="meta-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          LOCATION <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.68rem', color: '#2563eb' }}></i>
                        </span>
                        <span className="meta-value" style={{ color: '#2563eb', fontWeight: '700' }}>
                          {event.location || 'TRACE Expert City'}
                        </span>
                      </div>
                    </a>
                  </div>

                  {/* Featured Speaker Profile Card (Render ONLY if a real speaker was added) */}
                  {event.speaker &&
                    event.speaker.name &&
                    event.speaker.name.trim() !== '' &&
                    event.speaker.name !== 'TRACE Speaker' && (
                      <div className="details-speaker-card">
                        <div className="speaker-card-header">
                          <i className="fa-solid fa-user-tie"></i>
                          <h3>Featured Speaker</h3>
                        </div>
                        <div className="speaker-card-body">
                          <div className="speaker-avatar">
                            <img
                              src={
                                event.speaker.avatar ||
                                'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
                              }
                              alt={event.speaker.name || 'Speaker'}
                            />
                          </div>
                          <div className="speaker-info">
                            <h4>{event.speaker.name}</h4>
                            {event.speaker.role && <span className="speaker-role">{event.speaker.role}</span>}
                            {event.speaker.bio && <p className="speaker-bio">{event.speaker.bio}</p>}
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Key Highlights / Agenda */}
                  {event.highlights && event.highlights.length > 0 && (
                    <div className="details-highlights-box">
                      <h3><i className="fa-solid fa-list-check"></i> Key Event Highlights</h3>
                      <div className="highlights-tags-list">
                        {event.highlights.map((item, idx) => (
                          <span key={idx} className="highlight-tag-pill">
                            <i className="fa-solid fa-check"></i> {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* YouTube Video Preview / Keynote Recording */}
                  {event.videoUrl && getYouTubeEmbedUrl(event.videoUrl) && (
                    <div className="details-highlights-box" style={{ marginTop: '1.5rem' }}>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                        <i className="fa-brands fa-youtube" style={{ color: '#ef4444', fontSize: '1.25rem' }}></i> Event Video Recording & Media
                      </h3>
                      <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden', marginTop: '0.85rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                        <iframe
                          src={getYouTubeEmbedUrl(event.videoUrl)}
                          title={`${event.title} Video Preview`}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* Photo Gallery Showcase */}
                  {event.gallery && event.gallery.length > 0 && (
                    <div className="details-gallery-box">
                      <h3><i className="fa-regular fa-images"></i> Showcase Photo Gallery</h3>
                      <div className="details-gallery-showcase-grid">
                        {event.gallery.map((photo, idx) => (
                          <div key={idx} className="showcase-photo-card">
                            <img src={photo.url} alt={photo.caption || 'Event gallery photo'} />
                            {photo.caption && <span className="showcase-photo-caption">{photo.caption}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Registration Card Box */}
              <div className="details-right-column">
                <div className="registration-card-box">
                  <h2 className="registration-card-title">Register for this Event</h2>
                  <p className="registration-card-subtitle">
                    Secure your spot by providing your details below.
                  </p>

                  <form onSubmit={handleSubmit} className="registration-form">
                    <div className="form-field-group">
                      <label htmlFor="details-name">Full Name *</label>
                      <input
                        type="text"
                        id="details-name"
                        required
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="details-email">Email Address *</label>
                      <input
                        type="email"
                        id="details-email"
                        required
                        placeholder="jane@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="details-phone">Contact Number *</label>
                      <input
                        type="tel"
                        id="details-phone"
                        required
                        placeholder="+94 77 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-field-group">
                      <label htmlFor="details-message">Description / Message</label>
                      <textarea
                        id="details-message"
                        rows="3"
                        placeholder="Any special requirements or questions?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="form-checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                          required
                        />
                        <span>
                          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>. *
                        </span>
                      </label>
                    </div>

                    <div className="form-button-row">
                      <button
                        type="submit"
                        className="btn-submit-registration"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                          </>
                        ) : (
                          <>
                            Submit Registration <i className="fa-solid fa-arrow-right"></i>
                          </>
                        )}
                      </button>
                      <button type="button" className="btn-cancel-registration" onClick={onBack}>
                        Cancel
                      </button>
                    </div>

                    <div className="security-notice-text">
                      <i className="fa-solid fa-lock"></i>
                      <span>
                        Your information will only be used for event registration and event-related communication.
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Master TRACE Event Hub Footer */}
      <Footer setActiveTab={onBack} />
    </div>
  );
}
