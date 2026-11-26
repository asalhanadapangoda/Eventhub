import React, { useState, useEffect } from 'react';
import { stripHtml } from '../utils/eventUtils';

export default function CalendarPage({
  currentUser,
  registeredEvents = [],
  onSelectEvent,
  onOpenUpcoming,
  showToast,
  openLoginModal,
}) {
  // Calendar Navigation State - Default to current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'
  const [eventsList, setEventsList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch real registered events ONLY for the logged-in user
  useEffect(() => {
    const fetchUserRegisteredEvents = async () => {
      const userEmail = currentUser?.email;

      if (userEmail) {
        try {
          const res = await fetch(`/api/registrations/user/${encodeURIComponent(userEmail.trim())}`);
          const data = await res.json();

          if (data.success && data.data) {
            const userEvts = data.data.map((reg) => ({
              _id: reg.eventId?._id || reg.eventId || reg._id,
              title: reg.eventId?.title || reg.eventTitle || 'Registered Event',
              date: reg.eventId?.date || reg.eventDate || new Date().toISOString(),
              time: reg.eventId?.time || reg.eventTime || '09:00 AM - 05:00 PM',
              location: reg.eventId?.location || reg.eventLocation || 'TRACE Expert City, Colombo',
              description: reg.eventId?.description || 'Registered TRACE Event',
              coverImage:
                reg.eventId?.coverImage ||
                reg.coverImage ||
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
              ticketId: reg.ticketId,
            }));

            setEventsList(userEvts);

            if (userEvts.length > 0) {
              const firstEvt = userEvts[0];
              const evtDateObj = new Date(firstEvt.date);
              setSelectedEvent(firstEvt);
              setSelectedDate(evtDateObj);
              // Auto-navigate calendar view to the month of the user's first registered event!
              setCurrentDate(new Date(evtDateObj.getFullYear(), evtDateObj.getMonth(), 1));
            } else {
              setSelectedEvent(null);
              setSelectedDate(new Date());
            }
            return;
          }
        } catch (err) {
          console.error('Error fetching user registered events for calendar:', err);
        }
      }

      setEventsList([]);
      setSelectedEvent(null);
      setSelectedDate(new Date());
    };

    fetchUserRegisteredEvents();
  }, [currentUser]);

  // Calendar Date Math Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    if (eventsList.length > 0) {
      const d = new Date(eventsList[0].date);
      setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      setCurrentDate(new Date());
    }
  };

  // Google Calendar Integration
  const openGoogleCalendar = (evt) => {
    if (!evt) return;
    const evtDate = new Date(evt.date || Date.now());
    const startTimeStr = evtDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTimeStr = new Date(evtDate.getTime() + 2 * 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '');

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      evt.title
    )}&dates=${startTimeStr}/${endTimeStr}&details=${encodeURIComponent(
      evt.description || ''
    )}&location=${encodeURIComponent(evt.location || '')}`;

    window.open(url, '_blank');
  };

  // ICS Download Helper
  const downloadIcs = (evt) => {
    if (!evt) return;
    const evtDate = new Date(evt.date || Date.now());
    const formatDateForIcs = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TRACE Event Hub//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:CAL-${Date.now()}@trace.lk`,
      `DTSTAMP:${formatDateForIcs(new Date())}`,
      `DTSTART:${formatDateForIcs(evtDate)}`,
      `DTEND:${formatDateForIcs(new Date(evtDate.getTime() + 2 * 3600000))}`,
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${(evt.description || '').replace(/\n/g, ' ')}`,
      `LOCATION:${evt.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${(evt.title || 'Event').replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (showToast) showToast('Downloaded Calendar Invite (.ics)', 'success');
  };

  // Build 35/42 Grid Days for Current Month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const prevMonthDays = new Date(year, month, 0).getDate();

  const gridCells = [];

  // Previous month padding days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    gridCells.push({
      dayNumber: prevMonthDays - i,
      isCurrentMonth: false,
      dateObj: new Date(year, month - 1, prevMonthDays - i),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateObj: new Date(year, month, d),
    });
  }

  // Next month padding days to fill 35 or 42 cells
  const totalCellsSoFar = gridCells.length;
  const targetTotal = totalCellsSoFar > 35 ? 42 : 35;
  for (let n = 1; n <= targetTotal - totalCellsSoFar; n++) {
    gridCells.push({
      dayNumber: n,
      isCurrentMonth: false,
      dateObj: new Date(year, month + 1, n),
    });
  }

  // Helper to format date to YYYY-MM-DD
  const formatYYYYMMDD = (d) => {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };

  // Check if a cell has registered events
  const getEventsForCell = (cellDateObj) => {
    if (!eventsList || eventsList.length === 0) return [];
    const cellStr = formatYYYYMMDD(cellDateObj);
    return eventsList.filter((e) => formatYYYYMMDD(e.date) === cellStr);
  };

  // Handle cell click (Date selection)
  const handleCellClick = (cell) => {
    setSelectedDate(cell.dateObj);
    const cellEvents = getEventsForCell(cell.dateObj);
    if (cellEvents.length > 0) {
      setSelectedEvent(cellEvents[0]);
    } else {
      setSelectedEvent(null);
    }
  };

  return (
    <div className="calendar-page-container">
      <div className="calendar-page-inner">
        {/* Page Header */}
        <div className="calendar-page-header">
          <h1 className="calendar-page-title">My Calendar</h1>
          <p className="calendar-page-sub">
            Keep track of the TRACE events you have registered for.
          </p>
        </div>

        {!currentUser ? (
          <div
            className="empty-state"
            style={{
              padding: '4rem 2rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              margin: '2rem auto',
              maxWidth: '500px',
            }}
          >
            <i className="fa-solid fa-lock" style={{ fontSize: '2.5rem', color: '#64748b', marginBottom: '1rem' }}></i>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Log In Required</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Please log in to view your calendar of registered events.</p>
            <button className="btn btn-primary" onClick={openLoginModal}>
              Log In Now
            </button>
          </div>
        ) : (
          /* 2-Column Main Layout */
          <div className="calendar-main-grid">
          {/* LEFT COLUMN: Calendar Card & Month Grid */}
          <div className="calendar-card-panel">
            {/* Toolbar Header */}
            <div className="calendar-toolbar">
              <div className="toolbar-left">
                <button className="btn-today" onClick={handleToday}>
                  Today
                </button>
                <div className="month-navigation">
                  <button className="nav-arrow-btn" onClick={handlePrevMonth}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <span className="current-month-label">
                    {monthNames[month]} {year}
                  </span>
                  <button className="nav-arrow-btn" onClick={handleNextMonth}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </div>

              <div className="view-mode-toggle">
                <button
                  className={`mode-btn ${viewMode === 'month' ? 'active' : ''}`}
                  onClick={() => setViewMode('month')}
                >
                  Month
                </button>
                <button
                  className={`mode-btn ${viewMode === 'week' ? 'active' : ''}`}
                  onClick={() => setViewMode('week')}
                >
                  Week
                </button>
                <button
                  className={`mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  List
                </button>
              </div>
            </div>

            {/* Days of Week Row */}
            <div className="calendar-days-header">
              <span>SUN</span>
              <span>MON</span>
              <span>TUE</span>
              <span>WED</span>
              <span>THU</span>
              <span>FRI</span>
              <span>SAT</span>
            </div>

            {/* Month Grid Cells */}
            <div className="calendar-grid-cells">
              {gridCells.map((cell, idx) => {
                const cellEvents = getEventsForCell(cell.dateObj);
                const hasEvent = cellEvents.length > 0;
                const isSelectedDay =
                  selectedDate && formatYYYYMMDD(selectedDate) === formatYYYYMMDD(cell.dateObj);

                return (
                  <div
                    key={idx}
                    className={`calendar-cell ${
                      !cell.isCurrentMonth ? 'other-month' : ''
                    } ${isSelectedDay ? 'selected-day' : ''}`}
                    onClick={() => handleCellClick(cell)}
                  >
                    <span className={`cell-day-num ${hasEvent ? 'event-day-num' : ''}`}>
                      {cell.dayNumber}
                    </span>

                    {/* Registered Event Pill */}
                    {hasEvent && (
                      <div className="cell-event-pills-list">
                        {cellEvents.map((evt, eIdx) => (
                          <div
                            key={eIdx}
                            className="calendar-event-pill"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(cell.dateObj);
                              setSelectedEvent(evt);
                            }}
                          >
                            <i className="fa-regular fa-clock"></i>
                            <span className="pill-text">
                              {evt.time ? evt.time.split('-')[0].trim() : '09:00 AM'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: Event Preview & Reminder Cards */}
          <div className="calendar-side-column">
            {/* Card 1: Registered Event Preview Card */}
            {selectedEvent ? (
              <div className="event-side-card">
                <div className="side-card-image-box">
                  <img
                    src={
                      selectedEvent.coverImage ||
                      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={selectedEvent.title}
                  />
                  <span className="registered-badge-pill">
                    <i className="fa-solid fa-circle-check"></i> Registered
                  </span>
                </div>

                <div className="side-card-body">
                  <h3 className="side-event-title">{selectedEvent.title}</h3>

                  <div className="side-meta-row">
                    <i className="fa-regular fa-calendar"></i>
                    <span>
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="side-meta-row">
                    <i className="fa-regular fa-clock"></i>
                    <span>{selectedEvent.time || '09:00 AM - 05:00 PM'}</span>
                  </div>

                  <div className="side-meta-row">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{selectedEvent.location || 'TRACE Expert City, Colombo'}</span>
                  </div>

                  <p className="side-event-description">{stripHtml(selectedEvent.description)}</p>

                  <div className="side-actions-group">
                    <button
                      className="btn-side-view-event"
                      onClick={() => onSelectEvent && onSelectEvent(selectedEvent)}
                    >
                      View Event
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="event-side-card"
                style={{
                  padding: '2.5rem 1.5rem',
                  textAlign: 'center',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    margin: '0 auto 1.25rem auto',
                  }}
                >
                  <i className="fa-regular fa-calendar-xmark"></i>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                  No Event Registered
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 1.25rem 0' }}>
                  {selectedDate
                    ? `You have not registered for any events on ${selectedDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}.`
                    : 'Click a date with a blue badge to view your registered event details.'}
                </p>
                <button
                  className="btn-side-gcal"
                  style={{ borderColor: '#cbd5e1', color: '#475569', margin: '0 auto', maxWidth: '220px' }}
                  onClick={onOpenUpcoming}
                >
                  Browse Upcoming Events
                </button>
              </div>
            )}

            {/* Card 2: Reminder Enabled Banner */}
            <div className="reminder-banner-card">
              <div className="reminder-icon-circle">
                <i className="fa-solid fa-bell"></i>
              </div>
              <div>
                <h4>Reminder Enabled</h4>
                <p>
                  Your registered events will send you a reminder notification 1 day before the event.
                </p>
              </div>
            </div>

            {/* Card 3: Upcoming Registered Events List */}
            <div className="upcoming-side-panel">
              <h3 className="upcoming-panel-title">Upcoming Registered Events</h3>

              {eventsList.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  No registered events found. Explore upcoming events to register!
                </p>
              ) : (
                <div className="upcoming-mini-list">
                  {eventsList.slice(0, 3).map((evt, idx) => (
                    <div
                      key={evt._id || idx}
                      className="mini-event-item"
                      onClick={() => {
                        setSelectedEvent(evt);
                        const d = new Date(evt.date);
                        setSelectedDate(d);
                        setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                      }}
                    >
                      <div>
                        <div className="mini-title">{evt.title}</div>
                        <div className="mini-meta">
                          <i className="fa-regular fa-clock"></i>{' '}
                          {evt.time ? evt.time.split('-')[0].trim() : '09:00 AM'} |{' '}
                          <i className="fa-solid fa-location-dot"></i> TRACE Expert City
                        </div>
                      </div>

                      <span className="mini-date-badge">
                        {new Date(evt.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                className="btn-view-all-upcoming-link"
                onClick={onOpenUpcoming}
              >
                View All Upcoming
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
