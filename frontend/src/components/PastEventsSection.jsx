import React, { useState, useMemo } from 'react';
import { isEventPast, stripHtml, optimizeImageUrl } from '../utils/eventUtils';

export default function PastEventsSection({
  events = [],
  loading = false,
  setActiveTab,
  onSelectPastEvent,
  isFullView = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Any Location');

  // Filter real past events from database (events where date and set time have finished)
  const dbPastEvents = useMemo(() => {
    return events.filter((e) => isEventPast(e));
  }, [events]);

  // Only use published DB past events (no hardcoded samples)
  const allPastEvents = dbPastEvents;

  const categories = useMemo(() => {
    const cats = new Set([
      'All Categories',
      'Guest Talk Series',
      'Community Meetup',
      'Policy Discussion',
    ]);
    allPastEvents.forEach((e) => {
      if (e.category && e.category.trim()) cats.add(e.category.trim());
    });
    return Array.from(cats);
  }, [allPastEvents]);

  const locations = [
    'Any Location',
    'Third Place',
    'Bay 7',
    'TRACE Expert City',
  ];

  // Filter list based on search, category, location, and date
  const filteredPastEvents = useMemo(() => {
    return allPastEvents.filter((item) => {
      // Search Query
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

      // Category filter
      if (selectedCategory !== 'All Categories') {
        const selCat = selectedCategory.toLowerCase();
        const evtCat = (item.category || '').toLowerCase();
        const evtTitle = (item.title || '').toLowerCase();

        if (selCat === 'guest talk series') {
          const isGuestTalk = evtCat.includes('guest talk') || evtCat === 'talk' || evtTitle.includes('guest talk');
          if (!isGuestTalk) return false;
        } else if (selCat === 'community meetup') {
          const isCommunityMeetup = evtCat.includes('community') || evtCat === 'meetup' || evtTitle.includes('midweek');
          if (evtTitle.includes('shed') && !evtTitle.includes('midweek')) {
            return false;
          }
          if (!isCommunityMeetup) return false;
        } else if (selCat === 'policy discussion') {
          const isPolicy = evtCat.includes('policy') || evtTitle.includes('shed');
          if (!isPolicy) return false;
        } else {
          if (evtCat !== selCat) {
            return false;
          }
        }
      }

      // Location filter
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

      // Date filter
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
  }, [allPastEvents, searchQuery, selectedCategory, selectedLocation, selectedDate]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
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

  const getCategoryClass = (category) => {
    const lower = (category || '').toLowerCase();
    if (lower.includes('talk') || lower.includes('guest')) return 'cat-badge-talk';
    if (lower.includes('meetup') || lower.includes('community')) return 'cat-badge-meetup';
    if (lower.includes('policy') || lower.includes('shed') || lower.includes('discus')) return 'cat-badge-policy';
    if (lower.includes('workshop')) return 'cat-badge-workshop';
    return 'cat-badge-default';
  };

  // ----------------------------------------------------
  // FULL PAGE VIEW (When activeTab === 'past' or isFullView === true)
  // ----------------------------------------------------
  if (isFullView) {
    return (
      <div className="upcoming-events-page past-events-page">
        <div className="section-container">
          {/* Page Title & Subtitle Header matching Upcoming Events */}
          <div className="page-header">
            <h1 className="page-title">Past Events</h1>
            <p className="page-subtitle">
              Discover past talks, meetups, workshops and community events at TRACE.
            </p>
          </div>

          {/* Filters Bar matching reference screenshot */}
          <div className="filter-bar-container">
            <div className="filter-item">
              <label htmlFor="past-filter-search">Search Events</label>
              <div className="search-input-wrapper">
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
                <input
                  type="text"
                  id="past-filter-search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-item">
              <label htmlFor="past-filter-category">Category</label>
              <div className="select-wrapper">
                <select
                  id="past-filter-category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down select-arrow"></i>
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

          {/* Loading Spinner only if no events are cached/ready yet */}
          {loading && filteredPastEvents.length === 0 && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading past events...</p>
            </div>
          )}

          {/* Empty State matching Upcoming Events */}
          {!loading && filteredPastEvents.length === 0 && (
            <div className="empty-state">
              <i className="fa-solid fa-calendar-xmark"></i>
              <h3>No past events found</h3>
              <p>Try resetting or adjusting your search criteria and filters.</p>
            </div>
          )}

          {/* Full Grid of Past Events: Renders immediately with zero delay */}
          {filteredPastEvents.length > 0 && (
            <div className="events-grid-3col">
              {filteredPastEvents.map((item) => {
                const isUserUploaded = Boolean(item.createdBy || (item._id && !item._id.startsWith('past-evt-')));
                const formattedDate = formatPastDate(item.date, item.time);
                const catClass = getCategoryClass(item.category);
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
                      <span className={`cat-pill ${catClass}`}>
                        {(item.category || 'PAST EVENT').toUpperCase()}
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
          )}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HOME PAGE FEATURED SHOWCASE SECTION VIEW
  // ----------------------------------------------------
  const homePastEvents = useMemo(() => {
    return dbPastEvents.slice(0, 3);
  }, [dbPastEvents]);

  const handleNavigateToPastEvents = () => {
    if (setActiveTab) {
      setActiveTab('past');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isFullView && homePastEvents.length === 0) {
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
            onClick={handleNavigateToPastEvents}
          >
            See More <i className="fa-solid fa-arrow-right-long"></i>
          </button>
        </div>

        {/* Dynamic Grid Showing At Least 2 Past Events */}
        <div className="events-grid-3col">
          {homePastEvents.map((item) => {
            const formattedDate = formatPastDate(item.date, item.time);
            const catClass = getCategoryClass(item.category);
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
                  <span className={`cat-pill ${catClass}`}>
                    {(item.category || 'PAST EVENT').toUpperCase()}
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

      </div>
    </section>
  );
}
