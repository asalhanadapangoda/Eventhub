import React, { useState } from 'react';

export default function MyRegistrationsModal({ isOpen, onClose, showToast }) {
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState([]);
  const [venueBookings, setVenueBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('events'); // 'events' | 'venues'
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showToast('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // 1. Fetch Event Registrations
      const response = await fetch(`/api/registrations/user/${encodeURIComponent(email.trim())}`);
      const result = await response.json();
      if (result.success) {
        setTickets(result.data || []);
      } else {
        setTickets([]);
      }

      // 2. Fetch Venue Space Bookings
      const resBookings = await fetch(`/api/venue-bookings/user/${encodeURIComponent(email.trim())}`);
      const dataBookings = await resBookings.json();
      if (dataBookings.success) {
        setVenueBookings(dataBookings.data || []);
      } else {
        setVenueBookings([]);
      }
    } catch (error) {
      console.error('Error looking up records:', error);
      showToast('Failed to fetch records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadIcs = (reg) => {
    const eventDate = new Date(reg.eventDate);
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const startDateStr = formatDate(eventDate);
    const endDateStr = formatDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000));

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventHub Community//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${reg.ticketId}@eventhub.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:${reg.eventTitle}`,
      `DESCRIPTION:Registered Event Ticket | Pass: ${reg.ticketId}`,
      `LOCATION:${reg.eventLocation}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:Reminder: 1 Day until ${reg.eventTitle}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${reg.eventTitle.replace(/\s+/g, '_')}_Reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Downloaded Calendar Invite (.ics)', 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <h2><i className="fa-solid fa-ticket"></i> Find My Registrations & Space Bookings</h2>
        <p className="modal-sub">Enter your email address to view all your registered event tickets and venue space booking requests.</p>

        <form className="search-form" onSubmit={handleLookup} style={{ display: 'flex', gap: '0.5rem', margin: '1.25rem 0' }}>
          <input
            type="email"
            placeholder="Enter your email address..."
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-blue-pill" disabled={loading}>
            <i className="fa-solid fa-magnifying-glass"></i> Search
          </button>
        </form>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Searching records...</p>
          </div>
        )}

        {!loading && searched && (
          <div>
            {/* Navigation Sub-Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'events' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('events')}
              >
                <i className="fa-solid fa-ticket"></i> Event Tickets ({tickets.length})
              </button>

              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'venues' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('venues')}
              >
                <i className="fa-solid fa-building"></i> Venue Space Bookings ({venueBookings.length})
              </button>
            </div>

            {/* TAB 1: EVENT TICKETS */}
            {activeTab === 'events' && (
              <div>
                {tickets.length === 0 ? (
                  <p className="modal-sub" style={{ padding: '1rem 0' }}>No event tickets found for <strong>{email}</strong>.</p>
                ) : (
                  <div className="registrations-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '50vh', overflowY: 'auto' }}>
                    {tickets.map((reg) => {
                      const formattedDate = new Date(reg.eventDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      });

                      return (
                        <div
                          key={reg._id}
                          className="ticket-item"
                          style={{
                            background: 'var(--bg-subtle)',
                            padding: '1rem',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div className="ticket-info">
                            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{reg.eventTitle}</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0' }}>
                              <i className="fa-regular fa-calendar"></i> {formattedDate} | Pass ID: <strong>{reg.ticketId}</strong>
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                              <i className="fa-solid fa-location-dot"></i> {reg.eventLocation}
                            </p>
                          </div>
                          <button className="btn btn-sm btn-outline" onClick={() => downloadIcs(reg)}>
                            <i className="fa-regular fa-calendar-plus"></i> .ics
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: VENUE SPACE BOOKINGS */}
            {activeTab === 'venues' && (
              <div>
                {venueBookings.length === 0 ? (
                  <p className="modal-sub" style={{ padding: '1rem 0' }}>No space booking requests found for <strong>{email}</strong>.</p>
                ) : (
                  <div className="registrations-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '50vh', overflowY: 'auto' }}>
                    {venueBookings.map((bk) => (
                      <div
                        key={bk._id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          padding: '1rem 1.25rem',
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>{bk.venueName}</strong>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#5d4df6', background: '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>
                              {bk.branch}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0.2rem 0' }}>
                            <strong>Event Purpose:</strong> {bk.eventTitle}
                          </p>
                          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                            <i className="fa-regular fa-calendar"></i> Date: {bk.eventDate} | <i className="fa-regular fa-clock"></i> Duration: {bk.durationHours || 4} Hrs | Ref: <strong>{bk.bookingRef}</strong> | {bk.guests} Guests
                          </p>
                        </div>

                        <div>
                          <span
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              backgroundColor: bk.status === 'Confirmed' ? '#dcfce7' : bk.status === 'Cancelled' ? '#fee2e2' : bk.status === 'Contacted' ? '#e0f2fe' : '#fef3c7',
                              color: bk.status === 'Confirmed' ? '#15803d' : bk.status === 'Cancelled' ? '#b91c1c' : bk.status === 'Contacted' ? '#0369a1' : '#b45309',
                            }}
                          >
                            ● {bk.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
