import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, registrationData, showToast }) {
  if (!isOpen || !registrationData) return null;

  const { registration, event } = registrationData;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const downloadIcs = () => {
    const eventDate = new Date(event.date);
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
      `UID:${registration.ticketId}@eventhub.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, ' ')} | Ticket Pass: ${registration.ticketId}`,
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
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_Reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Downloaded 1-Day Reminder Calendar Invite (.ics)', 'success');
  };

  const openGoogleCalendar = () => {
    const eventDate = new Date(event.date);
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const start = formatDate(eventDate);
    const end = formatDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000));

    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(
      event.location
    )}&add=1day_reminder`;

    window.open(gCalUrl, '_blank');
  };

  const requestBrowserNotification = () => {
    if (!('Notification' in window)) {
      showToast('Browser notifications are not supported on this browser.', 'error');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        showToast('Browser reminder notifications enabled! You will be notified 1 day before the event.', 'success');
        new Notification('EventHub Reminder Set!', {
          body: 'We will notify you 1 day prior to your upcoming event.',
        });
      } else {
        showToast('Browser notification permission was denied.', 'error');
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="modal-card ticket-modal" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon"><i className="fa-solid fa-circle-check" aria-hidden="true"></i></div>
        <h2 id="confirm-modal-title">Registration Successful!</h2>
        <p className="success-sub">You are registered! Here is your official TRACE Event Pass.</p>

        <div className="ticket-card">
          <div className="ticket-header">
            <span className="ticket-brand">TRACE Event Hub Official Pass</span>
            <span className="ticket-id">{registration.ticketId}</span>
          </div>
          <div className="ticket-body">
            <h3>{event.title}</h3>
            <div className="ticket-meta">
              <p><i className="fa-regular fa-calendar"></i> {formattedDate} @ {event.time}</p>
              <p><i className="fa-solid fa-location-dot"></i> {event.location}</p>
              <p><i className="fa-regular fa-user"></i> Attendee: <strong>{registration.name}</strong></p>
            </div>
          </div>
          <div className="ticket-footer">
            <div className="qr-placeholder">
              <i className="fa-solid fa-qrcode"></i>
              <span>Valid Pass</span>
            </div>
            <div className="reminder-tag">
              <i className="fa-solid fa-bell"></i> 1-Day Prior Alarm Included
            </div>
          </div>
        </div>

        <div className="ticket-actions">
          <button className="btn btn-teal-submit" onClick={downloadIcs}>
            <i className="fa-regular fa-calendar-plus"></i> Download Calendar Invite (.ics)
          </button>
          <button className="btn btn-outline" onClick={openGoogleCalendar}>
            <i className="fa-brands fa-google"></i> Add to Google Calendar
          </button>
          <button className="btn btn-outline" onClick={requestBrowserNotification}>
            <i className="fa-solid fa-bell"></i> Enable Browser 1-Day Reminder
          </button>
        </div>

        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
