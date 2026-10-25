import React, { useState, useEffect } from 'react';

export default function RegistrationModal({
  isOpen,
  onClose,
  event,
  currentUser,
  onSuccess,
  showToast,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setName(currentUser ? currentUser.name || '' : '');
      setEmail(currentUser ? currentUser.email || '' : '');
      setPhone(currentUser ? currentUser.contactNumber || '' : '');
      setNotes('');
    }
  }, [event, currentUser]);

  if (!isOpen || !event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onClose();
        onSuccess(result.data);
      } else {
        showToast(result.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Error registering:', error);
      showToast('Network error during registration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="modal-header">
          <span className="modal-badge"><i className="fa-solid fa-tag"></i> Free Registration</span>
          <h2>{event.title}</h2>
          <p className="modal-sub">
            <i className="fa-regular fa-clock"></i> {formattedDate} @ {event.time} | <i className="fa-solid fa-location-dot"></i> {event.location}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name *</label>
            <input
              type="text"
              id="reg-name"
              required
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email Address *</label>
            <input
              type="email"
              id="reg-email"
              required
              placeholder="john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-phone">Contact Phone Number *</label>
            <input
              type="tel"
              id="reg-phone"
              required
              placeholder="+94 77 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-notes">Special Requirements / Description (Optional)</label>
            <textarea
              id="reg-notes"
              rows="3"
              placeholder="Any questions for the speaker or dietary requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="form-notice">
            <i className="fa-solid fa-bell"></i> After registering, you can download a <strong>Calendar Invite (.ics)</strong> to sync directly with your calendar!
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-teal-submit" disabled={submitting}>
              {submitting ? (
                <><i className="fa-solid fa-spinner fa-spin"></i> Registering...</>
              ) : (
                <><i className="fa-solid fa-check"></i> Complete Registration</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
