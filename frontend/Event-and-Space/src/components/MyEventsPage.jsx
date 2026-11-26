import React, { useState, useEffect } from 'react';
import { isEventPast } from '../utils/eventUtils';

export default function MyEventsPage({
  currentUser,
  onViewEvent,
  onOpenCalendar,
  showToast,
  openLoginModal,
}) {
  const [activeSubTab, setActiveSubTab] = useState('upcoming');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserRegistrations = async (emailToFetch) => {
    if (!emailToFetch) {
      setRegistrations([]);
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`/api/registrations/user/${encodeURIComponent(emailToFetch.trim())}`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        // Map backend registrations to display items, strictly filtering out deleted/non-existent events
        const mapped = result.data
          .filter((reg) => reg.eventId && typeof reg.eventId === 'object' && reg.eventId._id)
          .map((reg) => {
            const evt = reg.eventId;
            return {
              _id: reg._id,
              eventId: evt._id,
              title: evt.title,
              description: evt.description || '',
              date: evt.date || new Date(),
              time: evt.time || '10:00 AM',
              location: evt.location || 'TRACE Expert City',
              coverImage: evt.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
              status: isEventPast(evt) ? 'past' : 'upcoming',
              ticketId: reg.ticketId,
            };
          });
        setRegistrations(mapped);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      fetchUserRegistrations(currentUser.email);
    } else {
      setRegistrations([]);
    }
  }, [currentUser]);

  const handleAddToGoogleCalendar = (eventItem) => {
    try {
      const eventDate = new Date(eventItem.date || Date.now());
      let startHours = 10;
      let startMinutes = 0;

      if (eventItem.time) {
        const timeMatch = eventItem.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
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
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours default

      const pad = (n) => String(n).padStart(2, '0');
      const toUtc = (d) =>
        `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

      const startUtc = toUtc(start);
      const endUtc = toUtc(end);

      const title = encodeURIComponent(eventItem.title || 'TRACE Event');
      const location = encodeURIComponent(eventItem.location || 'TRACE Expert City, Colombo');
      const details = encodeURIComponent(
        `Registered Event Pass on TRACE Event Hub\nTicket: ${eventItem.ticketId || 'CONFIRMED'}\nTime: ${eventItem.time || '10:00 AM'}\nLocation: ${eventItem.location || 'TRACE Expert City'}\n\nOrganized by TRACE Expert City.`
      );

      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;

      window.open(googleCalUrl, '_blank', 'noopener,noreferrer');

      if (showToast) {
        showToast('Opening Google Calendar to save event...', 'success');
      }
    } catch (err) {
      console.error('Error adding to Google Calendar:', err);
      downloadIcs(eventItem);
    }
  };

  const downloadIcs = (eventItem) => {
    const eventDate = new Date(eventItem.date || Date.now());
    const formatDateForIcs = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const startDateStr = formatDateForIcs(eventDate);
    const endDateStr = formatDateForIcs(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000));
    const ticketId = eventItem.ticketId || 'TICKET-' + Date.now();

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
      `SUMMARY:${eventItem.title}`,
      `DESCRIPTION:My Registered Event Pass | Ticket: ${ticketId}`,
      `LOCATION:${eventItem.location}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: 1 Day until ${eventItem.title}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${(eventItem.title || 'Event').replace(/\s+/g, '_')}_Reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) {
      showToast('Downloaded Calendar Invite (.ics)', 'success');
    }
  };

  const handleCancelRegistration = async (registrationId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to cancel your pass for "${eventTitle}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast(`Cancelled pass for "${eventTitle}"`, 'info');
        if (currentUser?.email) fetchUserRegistrations(currentUser.email);
      } else {
        if (showToast) showToast(data.message || 'Failed to cancel pass', 'error');
      }
    } catch (err) {
      console.error('Cancel pass error:', err);
      if (showToast) showToast('Network error while cancelling pass', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Nov 12, 2024';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredRegistrations = registrations.filter((item) => {
    if (activeSubTab === 'upcoming') return item.status !== 'past';
    return item.status === 'past';
  });

  return (
    <div className="my-events-page">
      <div className="section-container">
        {/* Page Header */}
        <div className="my-events-header">
          <h1 className="my-events-title">My Events</h1>
          <p className="my-events-subtitle">Manage your registrations and event schedules.</p>
        </div>

        {/* Subtab Filter Bar matching screenshot */}
        <div className="my-events-tab-bar">
          <button
            className={`my-tab-button ${activeSubTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('upcoming')}
          >
            Upcoming
          </button>
          <button
            className={`my-tab-button ${activeSubTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('past')}
          >
            Past
          </button>
        </div>

        {/* Unauthenticated State */}
        {!currentUser && (
          <div className="empty-state" style={{ padding: '3rem 1.5rem' }}>
            <i className="fa-solid fa-lock" style={{ fontSize: '2.5rem', color: '#64748b', marginBottom: '1rem' }}></i>
            <h3>Log In Required</h3>
            <p>Please log in to view and manage your registered event passes.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openLoginModal}>
              Log In Now
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {currentUser && loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your registered events...</p>
          </div>
        )}

        {/* Empty State */}
        {currentUser && !loading && filteredRegistrations.length === 0 && (
          <div className="empty-state">
            <i className="fa-solid fa-ticket-simple"></i>
            <h3>No registered events found</h3>
            <p>Explore upcoming events and click Register to reserve your place.</p>
          </div>
        )}

        {/* Registered Event Cards Grid (2 Columns) matching reference screenshot */}
        {currentUser && !loading && filteredRegistrations.length > 0 && (
          <div className="my-events-grid-2col">
            {filteredRegistrations.map((item) => (
              <div className="my-event-card" key={item._id}>
                {/* Banner Media */}
                <div
                  className="my-card-banner"
                  onClick={() => onViewEvent && onViewEvent(item)}
                  style={{ cursor: 'pointer' }}
                  title="Click / tap to view event details"
                >
                  <img src={item.coverImage} alt={item.title} />
                  <span className="registered-tag-pill">
                    <i className="fa-solid fa-circle-check"></i> Registered
                  </span>
                </div>

                {/* Card Content */}
                <div className="my-card-content">
                  <h3
                    className="my-card-title"
                    onClick={() => onViewEvent && onViewEvent(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.title}
                  </h3>

                  <div className="my-card-meta-line">
                    <i className="fa-regular fa-calendar"></i>
                    <span>
                      {formatDate(item.date)} • <i className="fa-regular fa-clock"></i> {item.time}
                    </span>
                  </div>

                  <div className="my-card-location-line">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{item.location}</span>
                  </div>

                  {/* Reminder Tag Badge matching screenshot */}
                  <div className="reminder-enabled-badge">
                    <i className="fa-regular fa-bell"></i>
                    <span>Reminder enabled</span>
                  </div>

                  {/* Action Buttons Row - Horizontal single line */}
                  <div className="my-card-actions-row">
                    <button
                      className="btn-my-view-event"
                      onClick={() => onViewEvent && onViewEvent(item)}
                    >
                      View Event
                    </button>
                    <button
                      className="btn-my-add-calendar"
                      onClick={() => handleAddToGoogleCalendar(item)}
                      title="Save this event directly to your Google Calendar"
                    >
                      <i className="fa-brands fa-google"></i>
                      <span>Add to Calendar</span>
                    </button>
                    {activeSubTab === 'upcoming' && (
                      <button
                        className="btn-my-cancel-pass"
                        onClick={() => handleCancelRegistration(item._id, item.title)}
                        title="Cancel this registration"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
