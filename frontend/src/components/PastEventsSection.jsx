import React, { useState, useMemo } from 'react';
import {
  isEventPast,
  stripHtml,
  optimizeImageUrl,
  SERIES_CATEGORIES,
  getEventSeriesCategory,
} from '../utils/eventUtils';

export default function PastEventsSection({
  events = [],
  loading = false,
  setActiveTab,
  onSelectPastEvent,
  isFullView = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeriesId, setSelectedSeriesId] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Any Location');
  const [showFullArchive, setShowFullArchive] = useState(false);

  // Filter real past events from database (events where date and set time have finished)
  const dbPastEvents = useMemo(() => {
    return events.filter((e) => isEventPast(e));
  }, [events]);

  // Only use events from database
  const allPastEvents = dbPastEvents;

  // Compute event counts and preview assets for each of the 4 primary series
  const seriesStats = useMemo(() => {
    return SERIES_CATEGORIES.map((series) => {
      const matchingEvents = allPastEvents.filter((e) => series.match(e));
      const latestEvent = matchingEvents[0] || null;
      return {
        ...series,
        count: matchingEvents.length,
        latestEvent,
        previewImage: latestEvent?.coverImage || series.defaultCover,
      };
    });
  }, [allPastEvents]);

  const locations = [
    'Any Location',
    'Third Place',
    'Bay 7',
    'TRACE Expert City',
  ];

  // Handler when user clicks a category card or pill
  const handleSelectSeries = (seriesId) => {
    setSelectedSeriesId(seriesId);
    setSearchQuery('');
    setSelectedDate('');
    setSelectedLocation('Any Location');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active series object if one is currently selected
  const activeSeries = useMemo(() => {
    if (selectedSeriesId === 'all') return null;
    return SERIES_CATEGORIES.find((s) => s.id === selectedSeriesId) || null;
  }, [selectedSeriesId]);

  // Filter list based on selected series, search, location, and date
  const filteredPastEvents = useMemo(() => {
    return allPastEvents.filter((item) => {
      // 1. Series filter
      if (selectedSeriesId !== 'all') {
        const targetSeries = SERIES_CATEGORIES.find((s) => s.id === selectedSeriesId);
        if (targetSeries && !targetSeries.match(item)) {
          return false;
        }
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = stripHtml(item.description || item.shortDescription || '').toLowerCase().includes(q);
        const matchesCat = item.category?.toLowerCase().includes(q);
        const matchesLoc = item.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesLoc) {
          return false;
        }
      }

      // 3. Location filter
      if (selectedLocation !== 'Any Location') {
        const locLower = (item.location || '').toLowerCase();
        if (selectedLocation === 'Bay 7') {
          if (!locLower.includes('bay 7') && !locLower.includes('bay 07')) {
            return false;
          }
        } else if (!locLower.includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // 4. Date filter
      if (selectedDate) {
        if (!item.date) return false;
        let matched = false;
        if (typeof item.date === 'string' && item.date.split('T')[0] === selectedDate) {
          matched = true;
        }
        try {
          const d = new Date(item.date);
          const localStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const isoStr = d.toISOString().split('T')[0];
          if (localStr === selectedDate || isoStr === selectedDate) {
            matched = true;
          }
        } catch (e) {
          // ignore
        }
        if (!matched) return false;
      }

      return true;
    });
  }, [allPastEvents, selectedSeriesId, searchQuery, selectedLocation, selectedDate]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDate('');
    setSelectedLocation('Any Location');
  };

  const handleFilterClick = (e) => {
    e?.preventDefault();
  };

  const handleCardClick = (evt) => {
    if (onSelectPastEvent) {
      onSelectPastEvent(evt);
    } else if (setActiveTab) {
      setActiveTab('past');
    }
  };

  const formatPastDate = (dateVal, timeStr) => {
    if (!dateVal) return timeStr || 'Completed';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return timeStr || 'Completed';
      const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month} ${day}, ${year}${timeStr ? ` • ${timeStr}` : ''}`;
    } catch (e) {
      return timeStr || 'Completed';
    }
  };

  const getEventBadgeDetails = (evt) => {
    const series = getEventSeriesCategory(evt);
    if (series) {
      return {
        badgeClass: series.badgeClass,
        badgeText: series.badgeText,
      };
    }
    const lower = (evt.category || '').toLowerCase();
    if (lower.includes('talk') || lower.includes('guest')) return { badgeClass: 'cat-badge-talk', badgeText: 'GUEST TALK' };
    if (lower.includes('meetup') || lower.includes('community') || lower.includes('midweek')) return { badgeClass: 'cat-badge-midweek', badgeText: 'MIDWEEK BOOST' };
    if (lower.includes('policy') || lower.includes('shed') || lower.includes('discus')) return { badgeClass: 'cat-badge-shed', badgeText: 'THE SHED' };
    if (lower.includes('reboot') || lower.includes('health')) return { badgeClass: 'cat-badge-reboot', badgeText: 'REBOOT.HEALTH' };
    if (lower.includes('workshop')) return { badgeClass: 'cat-badge-workshop', badgeText: 'WORKSHOP' };
    return { badgeClass: 'cat-badge-default', badgeText: (evt.category || 'PAST EVENT').toUpperCase() };
  };

  // ----------------------------------------------------
  // FULL PAGE VIEW (When activeTab === 'past' or isFullView === true)
  // ----------------------------------------------------
  if (isFullView) {
    return (
      <div className="upcoming-events-page past-events-page">
        <div className="section-container">
          {/* ===================================================================
              MODE 1: Category Detail View (Shown when a category card is clicked)
             =================================================================== */}
          {activeSeries ? (
            <div className="category-detail-view">
              {/* Active Category Banner with Back Button */}
              <div className="active-category-banner">
                <div className="active-cat-info">
                  <div className="active-cat-breadcrumb">
                    <span onClick={() => handleSelectSeries('all')} style={{ cursor: 'pointer', color: '#0284c7' }}>
                      <i className="fa-solid fa-shapes" style={{ marginRight: '5px' }}></i> Categories
                    </span>
                    <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem' }}></i>
                    <span className="current">{activeSeries.displayName || activeSeries.name}</span>
                  </div>
                  <h2 className="active-cat-title">
                    <i className={activeSeries.icon} style={{ color: activeSeries.accentColor }}></i>
                    {activeSeries.displayName || activeSeries.name}
                  </h2>
                  <p className="active-cat-desc">{activeSeries.description}</p>
                  <div className="active-cat-count-pill">
                    <i className="fa-solid fa-calendar-check"></i>
                    <span>
                      {filteredPastEvents.length} {filteredPastEvents.length === 1 ? 'Event' : 'Events'} in this series
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-back-categories"
                  onClick={() => handleSelectSeries('all')}
                >
                  <i className="fa-solid fa-arrow-left"></i> Back to Categories
                </button>
              </div>

              {/* Filters for this category */}
              <div className="filter-bar-container">
                <div className="filter-item">
                  <label htmlFor="past-filter-search">Search Events</label>
                  <div className="search-input-wrapper">
                    <i className="fa-solid fa-magnifying-glass search-icon"></i>
                    <input
                      type="text"
                      id="past-filter-search"
                      placeholder={`Search in ${activeSeries.name}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-item">
                  <label htmlFor="past-filter-date">Date</label>
                  <div className="date-input-wrapper">
                    <input
                      type="date"
                      id="past-filter-date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-item">
                  <label htmlFor="past-filter-location">Location</label>
                  <div className="select-wrapper">
                    <select
                      id="past-filter-location"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    <i className="fa-solid fa-chevron-down select-arrow"></i>
                  </div>
                </div>

                <div className="filter-actions">
                  <button className="btn-filter-submit" type="button" onClick={handleFilterClick}>
                    Filter
                  </button>
                  <button className="btn-filter-clear" type="button" onClick={handleClearFilters}>
                    Clear
                  </button>
                </div>
              </div>

              {/* Events Grid for Active Category */}
              {filteredPastEvents.length > 0 ? (
                <div className="events-grid-3col">
                  {filteredPastEvents.map((item) => {
                    const isUserUploaded = Boolean(item.createdBy || (item._id && !item._id.startsWith('past-evt-')));
                    const formattedDate = formatPastDate(item.date, item.time);
                    const { badgeClass, badgeText } = getEventBadgeDetails(item);

                    return (
                      <div
                        className="event-card-modern past-archive-card"
                        key={item._id || item.title}
                        onClick={() => handleCardClick(item)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-media">
                          <img
                            src={optimizeImageUrl(
                              item.coverImage ||
                              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=75',
                              800
                            )}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=75';
                            }}
                          />
                          <span className={`cat-pill ${badgeClass}`}>
                            {badgeText}
                          </span>

                          <span className="completed-badge-overlay">
                            <i className="fa-solid fa-circle-check"></i> Completed
                          </span>
                        </div>

                        <div className="card-content">
                          <div className="event-date-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span><i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i> {formattedDate}</span>
                            {isUserUploaded && (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  background: '#e0e7ff',
                                  color: '#3730a3',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                }}
                              >
                                <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '3px' }}></i> Uploaded
                              </span>
                            )}
                          </div>

                          <h3 className="event-card-title">{item.title}</h3>
                          <p className="event-card-description">{stripHtml(item.description || item.shortDescription)}</p>

                          <div className="event-location-row">
                            <i className="fa-solid fa-location-dot location-icon"></i>
                            <span>{item.location || 'TRACE Expert City, Colombo'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <i className={activeSeries.icon} style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '1rem' }}></i>
                  <h3>No events found in {activeSeries.displayName || activeSeries.name}</h3>
                  <p>Try resetting search filters or check other categories.</p>
                  <button
                    type="button"
                    className="btn-filter-clear"
                    style={{ marginTop: '1rem' }}
                    onClick={() => handleSelectSeries('all')}
                  >
                    <i className="fa-solid fa-arrow-left"></i> Back to Categories
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ===================================================================
               MODE 2: Landing View -> Large Category Cards ("me tika thibunma athi me page ekata")
               =================================================================== */
            <div className="category-hub-landing">
              {/* Page Title & Subtitle Header */}
              <div className="page-header" style={{ marginBottom: '2.5rem' }}>
                <h1 className="page-title">Past Events</h1>
                <p className="page-subtitle">
                  Discover past talks, meetups, workshops and signature series at TRACE Expert City.
                </p>
              </div>

              <section className="past-series-section">
                <div className="past-series-header-row">
                  <div>
                    <h2 className="past-series-header-title">
                      <i className="fa-solid fa-shapes" style={{ color: '#0284c7' }}></i>
                      Browse by Category &amp; Series
                    </h2>
                    <p className="past-series-header-subtitle">
                      Select a series to explore its completed sessions, photo galleries, and video highlights.
                    </p>
                  </div>
                </div>

                <div className="past-series-grid">
                  {seriesStats.map((s) => (
                    <div
                      key={s.id}
                      className="past-series-card"
                      onClick={() => handleSelectSeries(s.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') handleSelectSeries(s.id);
                      }}
                    >
                      <div className="past-series-card-media">
                        <img
                          src={optimizeImageUrl(s.previewImage, 800)}
                          alt={s.name}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = s.defaultCover;
                          }}
                        />
                        <div className="past-series-card-overlay">
                          <span className="past-series-icon-pill" style={{ background: s.accentColor }}>
                            <i className={s.icon}></i>
                          </span>
                          <span className="past-series-count-badge">
                            {s.count} {s.count === 1 ? 'Event' : 'Events'}
                          </span>
                        </div>
                      </div>

                      <div className="past-series-card-content">
                        <h3 className="past-series-card-title">{s.displayName || s.name}</h3>
                        <p className="past-series-card-desc">{s.description}</p>
                        <div className="past-series-card-action" style={{ color: s.accentColor }}>
                          <span>Explore Events</span>
                          <i className="fa-solid fa-arrow-right"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Subtle footer toggle to view full archive if user ever needs it */}
              <div style={{ textAlign: 'center', marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px dashed #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowFullArchive(!showFullArchive)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.92rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  <i className={`fa-solid ${showFullArchive ? 'fa-chevron-up' : 'fa-list-ul'}`}></i>
                  {showFullArchive ? 'Hide Full Archive List' : 'Looking for all past events? View Full Archive List'}
                </button>

                {showFullArchive && (
                  <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                    <div className="events-grid-3col">
                      {allPastEvents.map((item) => {
                        const formattedDate = formatPastDate(item.date, item.time);
                        const { badgeClass, badgeText } = getEventBadgeDetails(item);
                        return (
                          <div
                            className="event-card-modern past-archive-card"
                            key={item._id || item.title}
                            onClick={() => handleCardClick(item)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="card-media">
                              <img
                                src={optimizeImageUrl(item.coverImage, 800)}
                                alt={item.title}
                                loading="lazy"
                              />
                              <span className={`cat-pill ${badgeClass}`}>{badgeText}</span>
                              <span className="completed-badge-overlay">
                                <i className="fa-solid fa-circle-check"></i> Completed
                              </span>
                            </div>
                            <div className="card-content">
                              <div className="event-date-heading">
                                <i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i> {formattedDate}
                              </div>
                              <h3 className="event-card-title">{item.title}</h3>
                              <p className="event-card-description">{stripHtml(item.description || item.shortDescription)}</p>
                              <div className="event-location-row">
                                <i className="fa-solid fa-location-dot location-icon"></i>
                                <span>{item.location || 'TRACE Expert City, Colombo'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HOME PAGE FEATURED SHOWCASE SECTION VIEW
  // ----------------------------------------------------
  const homeDisplayEvents = useMemo(() => {
    if (selectedSeriesId !== 'all') {
      const targetSeries = SERIES_CATEGORIES.find((s) => s.id === selectedSeriesId);
      if (targetSeries) {
        return allPastEvents.filter((e) => targetSeries.match(e)).slice(0, 3);
      }
    }
    return allPastEvents.slice(0, 3);
  }, [allPastEvents, selectedSeriesId]);

  const handleNavigateToPastEvents = (seriesId = 'all') => {
    if (setActiveTab) {
      setActiveTab('past');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isFullView && allPastEvents.length === 0) {
    return null;
  }

  return (
    <section className="past-events-section" id="past-showcase">
      <div className="section-container">
        {/* Header with Title and Top See More Action */}
        <div className="past-section-header-row">
          <div className="past-section-header">
            <h2>Explore Past Events</h2>
            <p>Catch up on what you missed and get a feel for the TRACE experience.</p>
          </div>
          <button
            type="button"
            className="btn-see-more-header"
            onClick={() => handleNavigateToPastEvents(selectedSeriesId)}
          >
            See More <i className="fa-solid fa-arrow-right-long"></i>
          </button>
        </div>

        {/* Dynamic Grid Showing Past Events */}
        {homeDisplayEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', margin: 0 }}>No past events under this series yet.</p>
          </div>
        ) : (
          <div className="events-grid-3col">
            {homeDisplayEvents.map((item) => {
              const formattedDate = formatPastDate(item.date, item.time);
              const { badgeClass, badgeText } = getEventBadgeDetails(item);

              return (
                <div
                  className="event-card-modern past-archive-card past-event-home-card"
                  key={item._id || item.title}
                  onClick={() => handleCardClick(item)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-media">
                    <img
                      src={optimizeImageUrl(
                        item.coverImage ||
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=75',
                        800
                      )}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=75';
                      }}
                    />
                    <span className={`cat-pill ${badgeClass}`}>
                      {badgeText}
                    </span>

                    <span className="completed-badge-overlay">
                      <i className="fa-solid fa-circle-check"></i> Completed
                    </span>
                  </div>

                  <div className="card-content">
                    <div className="event-date-heading">
                      <i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i> {formattedDate}
                    </div>

                    <h3 className="event-card-title">{item.title}</h3>
                    <p className="event-card-description">{stripHtml(item.description || item.shortDescription)}</p>

                    <div className="event-location-row">
                      <i className="fa-solid fa-location-dot location-icon"></i>
                      <span>{item.location || 'TRACE Expert City, Colombo'}</span>
                    </div>
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
