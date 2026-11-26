import React from 'react';
import { isEventPast, stripHtml, optimizeImageUrl, DEFAULT_EVENT_BANNER } from '../utils/eventUtils';

export default function UpcomingEventsSection({
  events,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  loading,
  openRegistrationModal,
  openGalleryLightbox,
}) {
  const filteredEvents = events.filter((event) => {
    const isPast = isEventPast(event);
    if (isPast || event.status === 'draft') return false;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (event.title && event.title.toLowerCase().includes(q)) ||
      (event.description && stripHtml(event.description).toLowerCase().includes(q)) ||
      (event.category && event.category.toLowerCase().includes(q)) ||
      (event.speaker && event.speaker.name && event.speaker.name.toLowerCase().includes(q));

    return matchesSearch;
  });

  // Limit to 3 items on the home page preview
  const displayEvents = activeTab === 'home' ? filteredEvents.slice(0, 3) : filteredEvents;

  const getCategoryClass = (category) => {
    const lower = (category || '').toLowerCase();
    if (lower.includes('workshop')) return 'cat-workshop';
    if (lower.includes('meetup')) return 'cat-meetup';
    if (lower.includes('sprint')) return 'cat-sprint';
    return 'cat-default';
  };

  const formatEventDate = (dateStr, timeStr) => {
    const d = new Date(dateStr);
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month} ${day}, ${year} • ${timeStr}`;
  };

  return (
    <section className="events-main-section" id="events-section">
      <div className="section-container">
        
        <div className="section-header-row">
          <h2 className="section-title">
            Upcoming Events
          </h2>
          <div className="header-right-controls">
            <button
              className="view-all-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setActiveTab('upcoming');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              View all <i className="fa-solid fa-arrow-right-long"></i>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && displayEvents.length === 0 && (
          <div className="empty-state">
            <i className="fa-solid fa-calendar-xmark"></i>
            <h3>No upcoming events found</h3>
            <p>Try adjusting your search criteria or check back later for new events.</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && displayEvents.length > 0 && (
          <div className="events-grid">
            {displayEvents.map((event) => {
              const isUpcoming = event.status === 'upcoming';
              const catClass = getCategoryClass(event.category);
              const formattedDate = formatEventDate(event.date, event.time);

              return (
                <div
                  className="event-card"
                  key={event._id}
                  onClick={() => {
                    if (isUpcoming) {
                      openRegistrationModal(event);
                    }
                  }}
                  style={{ cursor: isUpcoming ? 'pointer' : 'default' }}
                >
                  <div
                    className="card-banner"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isUpcoming) {
                        openRegistrationModal(event);
                      } else {
                        openGalleryLightbox(event, 0);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    title="Click / tap to view event details"
                  >
                    <img
                      src={
                        optimizeImageUrl(event.coverImage, 800) ||
                        DEFAULT_EVENT_BANNER
                      }
                      alt={event.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.retried && event.coverImage) {
                          target.dataset.retried = 'true';
                          const separator = event.coverImage.includes('?') ? '&' : '?';
                          target.src = `${event.coverImage}${separator}t=${Date.now()}`;
                          return;
                        }
                        target.src = DEFAULT_EVENT_BANNER;
                      }}
                    />
                    <span className={`category-tag-pill ${catClass}`}>{event.category}</span>
                  </div>

                  <div className="card-body">
                    <div className="event-datetime">{formattedDate}</div>
                    <h3
                      className="card-title"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isUpcoming) openRegistrationModal(event);
                      }}
                      style={{ cursor: isUpcoming ? 'pointer' : 'default' }}
                    >
                      {event.title}
                    </h3>

                    <div className="card-location">
                      <i className="fa-solid fa-location-dot" style={{ color: 'var(--teal-accent)' }}></i>
                      <span>{event.location}</span>
                    </div>

                    <p className="card-desc">{stripHtml(event.description)}</p>

                    {/* Gallery Highlights if Past Event */}
                    {!isUpcoming && event.gallery && event.gallery.length > 0 && (
                      <div className="gallery-section" style={{ marginTop: '0.75rem' }}>
                        <div
                          className="gallery-title"
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: 'var(--text-muted)',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <i className="fa-solid fa-camera"></i> Photo Highlights ({event.gallery.length})
                        </div>
                        <div
                          className="gallery-grid"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4,1fr)',
                            gap: '0.4rem',
                          }}
                        >
                          {event.gallery.slice(0, 4).map((img, idx) => {
                            const imgUrl = typeof img === 'string' ? img : (img?.url || img);
                            return (
                              <div
                                key={idx}
                                className="gallery-thumb"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openGalleryLightbox(event, idx);
                                }}
                                style={{
                                  height: '50px',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                }}
                              >
                                <img
                                  src={optimizeImageUrl(imgUrl, 200)}
                                  alt="Gallery photo"
                                  loading="lazy"
                                  decoding="async"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {isUpcoming ? (
                      <button
                        className="btn-card-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRegistrationModal(event);
                        }}
                      >
                        View Details / Register
                      </button>
                    ) : (
                      <button
                        className="btn-card-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGalleryLightbox(event, 0);
                        }}
                      >
                        <i className="fa-solid fa-images"></i> View Event Showcase
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
