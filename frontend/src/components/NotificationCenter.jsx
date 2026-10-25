import React, { useState, useRef, useEffect } from 'react';
import { formatTimeAgo } from '../utils/notificationUtils';

export default function NotificationCenter({
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onNotificationClick,
  isTransparent = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
  const dropdownRef = useRef(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'event':
        return { icon: 'fa-bullhorn', bg: 'linear-gradient(135deg, #7c3aed, #5d4df6)' };
      case 'booking':
        return { icon: 'fa-building', bg: 'linear-gradient(135deg, #0284c7, #06b6d4)' };
      case 'registration':
        return { icon: 'fa-ticket', bg: 'linear-gradient(135deg, #059669, #10b981)' };
      case 'reminder':
        return { icon: 'fa-clock', bg: 'linear-gradient(135deg, #d97706, #f59e0b)' };
      default:
        return { icon: 'fa-circle-info', bg: 'linear-gradient(135deg, #4f46e5, #6366f1)' };
    }
  };

  const handleItemClick = (notif) => {
    if (!notif.read && onMarkAsRead) {
      onMarkAsRead(notif.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notif);
    }
    setIsOpen(false);
  };

  return (
    <div className="notif-center-wrapper" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        type="button"
        className={`notif-bell-btn ${isTransparent ? 'notif-bell-transparent' : ''} ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        aria-label="View notifications"
        title="Notifications"
      >
        <i className="fa-solid fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notif-badge-pill" aria-label={`${unreadCount} unread notifications`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="notif-dropdown-card" role="dialog" aria-modal="true">
          {/* Dropdown Header */}
          <div className="notif-header">
            <div className="notif-header-title">
              <span className="notif-title-text">Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-unread-tag">{unreadCount} new</span>
              )}
            </div>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="notif-action-link"
                  onClick={() => {
                    if (onMarkAllAsRead) onMarkAllAsRead();
                  }}
                  title="Mark all as read"
                >
                  <i className="fa-solid fa-check-double"></i> Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="notif-filter-bar">
            <button
              type="button"
              className={`notif-filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              className={`notif-filter-chip ${activeFilter === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="notif-list-container">
            {filteredNotifications.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon">
                  <i className="fa-regular fa-bell-slash"></i>
                </div>
                <h4 className="notif-empty-title">
                  {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h4>
                <p className="notif-empty-desc">
                  {activeFilter === 'unread'
                    ? "You've read all your recent notifications!"
                    : "You're all caught up! New events and booking updates will appear here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const iconMeta = getNotificationIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`notif-item ${!notif.read ? 'is-unread' : ''}`}
                    onClick={() => handleItemClick(notif)}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className="notif-item-icon"
                      style={{ background: iconMeta.bg }}
                    >
                      <i className={`fa-solid ${iconMeta.icon}`}></i>
                    </div>

                    <div className="notif-item-body">
                      <div className="notif-item-header">
                        <span className="notif-item-title">{notif.title}</span>
                        {!notif.read && <span className="notif-unread-dot" title="Unread"></span>}
                      </div>
                      <p className="notif-item-desc">{notif.message}</p>
                      <div className="notif-item-footer">
                        <span className="notif-item-time">
                          <i className="fa-regular fa-clock" style={{ marginRight: '4px' }}></i>
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                        {(notif.meta?.eventId || notif.meta?.bookingRef) && (
                          <span className="notif-item-action-hint">
                            {notif.meta?.eventId ? 'View Event' : 'View Space'}
                            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.65rem', marginLeft: '4px' }}></i>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer */}
          {notifications.length > 0 && (
            <div className="notif-footer">
              <button
                type="button"
                className="notif-clear-btn"
                onClick={() => {
                  if (onClearAll) onClearAll();
                }}
              >
                <i className="fa-regular fa-trash-can"></i> Clear all
              </button>
              <button
                type="button"
                className="notif-close-btn"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
