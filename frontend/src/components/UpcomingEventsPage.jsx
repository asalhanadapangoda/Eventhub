import React, { useState, useEffect, useMemo } from 'react';
import { isEventPast, stripHtml, optimizeImageUrl, DEFAULT_EVENT_BANNER } from '../utils/eventUtils';

export default function UpcomingEventsPage({
  events,
  loading,
  openRegistrationModal,
  currentUser,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Any Location');

  // Registered events tracking for logged-in user
  const [userRegisteredEvents, setUserRegisteredEvents] = useState(new Set());

  useEffect(() => {
    const fetchUserRegs = async () => {
      if (!currentUser?.email) {
        setUserRegisteredEvents(new Set());
        return;
      }
      try {
        const token = localStorage.getItem('eventhub_token');
        const res = await fetch(`/api/registrations/user/${encodeURIComponent(currentUser.email.trim())}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await res.json();
        if (data.success && data.data) {
          const registeredSet = new Set();
          data.data.forEach((reg) => {
            if (reg.eventId?._id) registeredSet.add(reg.eventId._id.toString());
            if (reg.eventId && typeof reg.eventId === 'string') registeredSet.add(reg.eventId.toString());
            if (reg.eventTitle) registeredSet.add(reg.eventTitle.trim());
          });
          setUserRegisteredEvents(registeredSet);
        } else {
          setUserRegisteredEvents(new Set());
        }
      } catch (err) {
        console.error('Error fetching user registrations for upcoming events:', err);
        setUserRegisteredEvents(new Set());
      }
    };

    fetchUserRegs();
  }, [currentUser]);

  const categories = useMemo(() => {
    const cats = new Set([
      'All Categories',
      'Guest Talk Series',
      'Community Meetup',
      'Policy Discussion',
    ]);
    events.forEach((e) => {
      if (e.category && e.category.trim()) cats.add(e.category.trim());
    });
    return Array.from(cats);
  }, [events]);

  const locations = [
    'Any Location',
    'Third Place',
    'Bay 7',
    'TRACE Expert City',
  ];

  const filteredUpcomingEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.status === 'draft') return false;
      if (isEventPast(event)) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title?.toLowerCase().includes(q);
        const matchesDesc = stripHtml(event.description || '').toLowerCase().includes(q);
        const matchesCat = event.category?.toLowerCase().includes(q);
        const matchesLoc = event.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesLoc) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All Categories') {
        const selCat = selectedCategory.toLowerCase();
        const evtCat = (event.category || '').toLowerCase();
        const evtTitle = (event.title || '').toLowerCase();

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
        const locLower = (event.location || '').toLowerCase();
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
        const eventDateStr = new Date(event.date).toISOString().split('T')[0];
        if (eventDateStr !== selectedDate) {
          return false;
        }
      }

      return true;
    });
  }, [events, searchQuery, selectedCategory, selectedLocation, selectedDate]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedDate('');
    setSelectedLocation('Any Location');
  };

  const getCategoryClass = (category) => {
    const lower = (category || '').toLowerCase();
    if (lower.includes('talk') || lower.includes('guest')) return 'cat-badge-talk';
    if (lower.includes('meetup') || lower.includes('community')) return 'cat-badge-meetup';
    if (lower.includes('policy') || lower.includes('shed') || lower.includes('discus')) return 'cat-badge-policy';
    if (lower.includes('workshop')) return 'cat-badge-workshop';
    return 'cat-badge-default';
  };

  const formatEventDate = (dateStr, timeStr) => {
    if (!dateStr) return timeStr || '';
    const d = new Date(dateStr);
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month} ${day}, ${year} • ${timeStr || ''}`;
  };

  return (
    <div className="upcoming-events-page">
      <div className="section-container">
        {/* Page Title & Subtitle Header */}
        <div className="page-header">
          <h1 className="page-title">Upcoming Events</h1>
          <p className="page-subtitle">
            Discover upcoming talks, meetups, workshops and community events at TRACE.
          </p>
        </div>

        {/* Filters Bar matching reference screenshot */}
        <div className="filter-bar-container">
          <div className="filter-item">
            <label htmlFor="filter-search">Search Events</label>
            <div className="search-input-wrapper">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                id="filter-search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-category">Category</label>
            <div className="select-wrapper">
              <select
                id="filter-category"
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
            <label htmlFor="filter-date">Date</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                id="filter-date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-item">
            <label htmlFor="filter-location">Location</label>
            <div className="select-wrapper">
              <select
                id="filter-location"
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
            <button className="btn-filter-submit">Filter</button>
            <button className="btn-filter-clear" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading upcoming events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredUpcomingEvents.length === 0 && (
          <div className="empty-state">
            <i className="fa-solid fa-calendar-xmark"></i>
            <h3>No upcoming events found</h3>
            <p>Try resetting or adjusting your search criteria and filters.</p>
          </div>
        )}

        {/* Events Grid matching reference layout */}
        {!loading && filteredUpcomingEvents.length > 0 && (
          <div className="events-grid-3col">
            {filteredUpcomingEvents.map((event) => {
              const catClass = getCategoryClass(event.category);
              const formattedDate = formatEventDate(event.date, event.time);
              const isRegistered = Boolean(
                currentUser &&
                (userRegisteredEvents.has(event._id?.toString()) || userRegisteredEvents.has(event.title?.trim()))
              );

              return (
                <div
                  className="event-card-modern"
                  key={event._id || event.title}
                  onClick={() => openRegistrationModal(event)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="card-media"
                    onClick={(e) => {
                      e.stopPropagation();
                      openRegistrationModal(event);
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
                    <span className={`cat-pill ${catClass}`}>
                      {(event.category || 'EVENT').toUpperCase()}
                    </span>

                    {isRegistered && (
                      <div className="registered-badge-overlay">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Registered</span>
                      </div>
                    )}
                  </div>

                  <div className="card-content">
                    <div className="event-date-heading">{formattedDate}</div>
                    <h3
                      className="event-card-title"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRegistrationModal(event);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {event.title}
                    </h3>
                    <p className="event-card-description">{stripHtml(event.description)}</p>

                    <div className="event-location-row">
                      <i className="fa-solid fa-location-dot location-icon"></i>
                      <span>{event.location}</span>
                    </div>

                    <div className="card-button-group">
                      <button
                        className="btn-details-outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRegistrationModal(event);
                        }}
                      >
                        View Details
                      </button>

                      {isRegistered ? (
                        <button
                          className="btn-registered-disabled"
                          disabled
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="fa-solid fa-check"></i> Joined
                        </button>
                      ) : (
                        <button
                          className="btn-register-solid"
                          onClick={(e) => {
                            e.stopPropagation();
                            openRegistrationModal(event);
                          }}
                        >
                          Register
                        </button>
                      )}
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
