import React, { useState, useEffect } from 'react';

export default function RegistrationModal({
  isOpen,
  onClose,
  event,
  currentUser,
  onSuccess,
  showToast,
  openLoginModal,
  openSignupModal,
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

    if (!currentUser) {
      showToast('You must create an account or log in to register for events.', 'error');
      if (openLoginModal) openLoginModal();
      return;
    }

    if (!name.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      showToast('Please enter a valid email address (e.g., name@domain.com).', 'error');
      return;
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{9,15}$/.test(cleanPhone)) {
      showToast('Please enter a valid contact phone number (at least 9-10 digits).', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const authToken = localStorage.getItem('eventhub_token');
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          eventId: event._id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          contactNumber: phone.trim(),
          notes: notes.trim(),
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
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

        {!currentUser ? (
          <div style={{ textAlign: 'center', padding: '1.25rem 0.5rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                color: '#5d4df6',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                marginBottom: '1rem',
              }}
            >
              <i className="fa-solid fa-user-lock"></i>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              Account Required to Register
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              You must create an account or log in to secure your spot and generate your ticket pass for <strong>{event.title}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (openSignupModal) openSignupModal();
                }}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem', fontWeight: 800 }}
              >
                <i className="fa-solid fa-user-plus"></i> Create Account to Register
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (openLoginModal) openLoginModal();
                }}
                className="btn btn-outline"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}
              >
                Already have an account? Log In
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reg-name">Full Name *</label>
              <input
                type="text"
                id="reg-name"
                required
                placeholder="Your full name"
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
                placeholder="yourname@domain.com"
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
                placeholder="+94 77 123 4567 or 077 123 4567"
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
        )}
      </div>
    </div>
  );
}
