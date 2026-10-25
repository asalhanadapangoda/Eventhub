/**
 * Notification Utilities for TRACE Event Hub
 * Manages in-app notifications, localStorage persistence, cross-tab broadcasts,
 * and relative time formatting.
 */

const STORAGE_KEY = 'eventhub_notifications_list';
const CHANNEL_NAME = 'eventhub_notifications_channel';

// Default initial notifications if user has no stored notifications
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-welcome-1',
    type: 'system',
    title: 'Welcome to TRACE SPACES & Events!',
    message: 'Explore upcoming tech summits, workshops, and book collaborative spaces across Sri Lanka.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    meta: {},
  },
];

/**
 * Retrieves stored notifications from localStorage
 * @returns {Array} Array of notification objects
 */
export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
      return DEFAULT_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading stored notifications:', e);
    return [];
  }
}

/**
 * Saves notifications list to localStorage and triggers a broadcast event
 * @param {Array} list - Array of notifications
 */
export function saveNotifications(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('eventhub_notifications_updated', { detail: list }));

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: 'NOTIFICATIONS_UPDATED', list });
        bc.close();
      } catch (err) {}
    }
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
}

/**
 * Adds a new notification to the top of the list
 * @param {Object} notif - { type, title, message, meta }
 * @returns {Array} Updated notification list
 */
export function addNotification({ type = 'info', title, message, meta = {} }) {
  if (!title) return getStoredNotifications();

  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    meta,
  };

  const current = getStoredNotifications();
  // Keep max 40 recent notifications
  const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id)].slice(0, 40);
  saveNotifications(updated);
  return updated;
}

/**
 * Marks a single notification as read
 * @param {string} id - Notification ID
 */
export function markAsRead(id) {
  const current = getStoredNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
  return updated;
}

/**
 * Marks all notifications as read
 */
export function markAllAsRead() {
  const current = getStoredNotifications();
  const updated = current.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
  return updated;
}

/**
 * Clears all notifications
 */
export function clearAllNotifications() {
  saveNotifications([]);
  return [];
}

/**
 * Calculates human-readable relative time (e.g., 'Just now', '5m ago', '2h ago', 'Yesterday')
 * @param {string|Date} dateVal - Timestamp
 * @returns {string} Formatted relative string
 */
export function formatTimeAgo(dateVal) {
  if (!dateVal) return 'Just now';
  const now = new Date();
  const past = new Date(dateVal);
  const diffSecs = Math.floor((now - past) / 1000);

  if (diffSecs < 45) return 'Just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  if (diffSecs < 172800) return 'Yesterday';
  return `${Math.floor(diffSecs / 86400)}d ago`;
}

/**
 * Broadcasts a venue booking creation across the application
 * @param {Object} detail - Booking object
 */
export function notifyBookingCreated(detail) {
  if (!detail) return;
  try {
    window.dispatchEvent(new CustomEvent('eventhub_booking_created', { detail }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('eventhub_channel');
        bc.postMessage({ type: 'BOOKING_CREATED', detail });
        bc.close();
      } catch (err) {}
    }
    localStorage.setItem(
      'eventhub_last_booking_create',
      JSON.stringify({ detail, timestamp: Date.now() })
    );
  } catch (err) {
    console.error('Error broadcasting booking created:', err);
  }
}

/**
 * Broadcasts an event registration creation across the application
 * @param {Object} detail - Registration object
 */
export function notifyRegistrationCreated(detail) {
  if (!detail) return;
  try {
    window.dispatchEvent(new CustomEvent('eventhub_registration_created', { detail }));
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const bc = new BroadcastChannel('eventhub_channel');
        bc.postMessage({ type: 'REGISTRATION_CREATED', detail });
        bc.close();
      } catch (err) {}
    }
    localStorage.setItem(
      'eventhub_last_registration_create',
      JSON.stringify({ detail, timestamp: Date.now() })
    );
  } catch (err) {
    console.error('Error broadcasting registration created:', err);
  }
}
