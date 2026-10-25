import React, { useEffect } from 'react';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm, userName }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay logout-modal-overlay" onClick={onClose}>
      <div
        className="modal-card logout-confirm-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Warning / Logout Icon */}
        <div className="logout-icon-wrapper">
          <div className="logout-icon-circle">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </div>
        </div>

        {/* Modal Text Content */}
        <h2 id="logout-title" className="logout-modal-title">
          Are you sure you want to log out?
        </h2>
        <p className="logout-modal-description">
          {userName ? (
            <>You are currently signed in as <strong>{userName}</strong>. </>
          ) : null}
          You will need to sign back in to register for events, view your bookings, and access your profile.
        </p>

        {/* Action Buttons */}
        <div className="logout-modal-actions">
          <button
            type="button"
            className="btn btn-outline btn-cancel-logout"
            onClick={onClose}
          >
            Stay Signed In
          </button>
          <button
            type="button"
            className="btn btn-danger-logout"
            onClick={onConfirm}
          >
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
