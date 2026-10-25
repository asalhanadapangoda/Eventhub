import React from 'react';

export default function ToastNotification({ toast }) {
  if (!toast || !toast.visible) return null;

  const type = toast.type || 'info';

  const iconClass =
    type === 'success'
      ? 'fa-solid fa-circle-check'
      : type === 'error'
        ? 'fa-solid fa-circle-exclamation'
        : type === 'warning'
          ? 'fa-solid fa-triangle-exclamation'
          : 'fa-solid fa-circle-info';

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <i className={`${iconClass} toast-icon`} aria-hidden="true"></i>
      <span className="toast-message">{toast.message}</span>
    </div>
  );
}

