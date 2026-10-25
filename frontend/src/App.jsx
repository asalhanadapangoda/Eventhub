import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WhyJoinSection from './components/WhyJoinSection';
import UpcomingEventsSection from './components/UpcomingEventsSection';
import UpcomingEventsPage from './components/UpcomingEventsPage';
import PastEventsSection from './components/PastEventsSection';
import Footer from './components/Footer';
import ToastNotification from './components/modals/ToastNotification';
import {
  getStoredNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} from './utils/notificationUtils';

// Lazy-loaded pages (reduces initial bundle size and accelerates first page load)
const EventDetailsPage = React.lazy(() => import('./components/EventDetailsPage'));
const MyEventsPage = React.lazy(() => import('./components/MyEventsPage'));
const ProfilePage = React.lazy(() => import('./components/ProfilePage'));
const CalendarPage = React.lazy(() => import('./components/CalendarPage'));
const AdminDashboardPage = React.lazy(() => import('./components/AdminDashboardPage'));
const PastEventDetailsPage = React.lazy(() => import('./components/PastEventDetailsPage'));
const VenuesPage = React.lazy(() => import('./components/VenuesPage'));
const ChatbotAgent = React.lazy(() => import('./components/ChatbotAgent'));

// Lazy-loaded modals (only downloaded when triggered by user)
const RegistrationModal = React.lazy(() => import('./components/modals/RegistrationModal'));
const ConfirmationModal = React.lazy(() => import('./components/modals/ConfirmationModal'));
const LightboxModal = React.lazy(() => import('./components/modals/LightboxModal'));
const MyRegistrationsModal = React.lazy(() => import('./components/modals/MyRegistrationsModal'));
const AdminModal = React.lazy(() => import('./components/modals/AdminModal'));
const LoginModal = React.lazy(() => import('./components/modals/LoginModal'));
const SignupModal = React.lazy(() => import('./components/modals/SignupModal'));
const ForgotPasswordModal = React.lazy(() => import('./components/modals/ForgotPasswordModal'));
const LogoutConfirmModal = React.lazy(() => import('./components/modals/LogoutConfirmModal'));

const TAB_TO_HASH_MAP = {
  home: '#home',
  upcoming: '#upcoming',
  past: '#past',
  'venues-page': '#spaces',
  'my-events': '#my-events',
  calendar: '#calendar',
  profile: '#profile',
  admin: '#admin',
  'event-details': '#event-details',
  'past-details': '#past-details',
};

const HASH_TO_TAB_MAP = {
  '': 'home',
  '#': 'home',
  '#home': 'home',
  '#upcoming': 'upcoming',
  '#past': 'past',
  '#spaces': 'venues-page',
  '#venues': 'venues-page',
  '#my-events': 'my-events',
  '#calendar': 'calendar',
  '#profile': 'profile',
  '#admin': 'admin',
  '#event-details': 'event-details',
  '#past-details': 'past-details',
};

export default function App() {
  const [events, setEvents] = useState(() => {
    try {
      const cached = localStorage.getItem('eventhub_cached_events') || sessionStorage.getItem('eventhub_cached_events');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  });
  const [activeTab, setActiveTabState] = useState(() => {
    const rawHash = window.location.hash || '#home';
    const cleanHash = rawHash.split('?')[0];
    return HASH_TO_TAB_MAP[cleanHash] || 'home';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('eventhub_cached_events') || sessionStorage.getItem('eventhub_cached_events');
      const parsed = cached ? JSON.parse(cached) : [];
      return !(Array.isArray(parsed) && parsed.length > 0);
    } catch (e) {
      return true;
    }
  });

  // Selected event for full page details
  const [selectedDetailsEvent, setSelectedDetailsEvent] = useState(null);
  const [selectedPastEvent, setSelectedPastEvent] = useState(null);

  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('eventhub_token') || null);
  const [currentUser, setCurrentUser] = useState(null);

  // Modals State
  const [regEvent, setRegEvent] = useState(null);
  const [confData, setConfData] = useState(null);
  const [lightboxData, setLightboxData] = useState(null); // { event, index }
  const [showMyRegs, setShowMyRegs] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [loginPrefillEmail, setLoginPrefillEmail] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info', onAction: null, actionText: null });

  // In-App Notification Center State
  const [notifications, setNotifications] = useState(() => getStoredNotifications());
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Custom function to update activeTab AND synchronize URL Hash with optional entity id
  const setActiveTab = (newTab, entityId = null) => {
    setActiveTabState(newTab);
    let targetHash = TAB_TO_HASH_MAP[newTab] || '#home';
    if (entityId && (newTab === 'event-details' || newTab === 'past-details')) {
      targetHash += `?id=${entityId}`;
    }
    if (window.location.hash !== targetHash) {
      window.history.pushState({ tab: newTab }, '', targetHash);
    }
    if (['home', 'upcoming', 'past', 'past-details'].includes(newTab)) {
      fetchEvents(true); // Silent background refresh, keeps UI fast and instant
    }
  };

  // Synchronize browser URL hash & back/forward history navigation
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash || '#home';
      const cleanHash = rawHash.split('?')[0];
      if (cleanHash === '#forgot-password' || cleanHash === '#reset-password') {
        setShowForgotPassword(true);
      }
      const targetTab = HASH_TO_TAB_MAP[cleanHash] || 'home';
      setActiveTabState(targetTab);
    };

    // Check initial hash on load
    const initialRaw = window.location.hash || '';
    if (initialRaw.startsWith('#forgot-password') || initialRaw.startsWith('#reset-password')) {
      setShowForgotPassword(true);
    }

    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handleHashChange);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Listen for instant event update broadcasts across the app and browser tabs
  useEffect(() => {
    const applyLiveEventUpdate = (updated) => {
      if (!updated) return;
      if (updated.deleted && updated._id) {
        setEvents((prev) => {
          const filtered = prev.filter((evt) => String(evt._id || evt.id) !== String(updated._id));
          try {
            localStorage.setItem('eventhub_cached_events', JSON.stringify(filtered));
            sessionStorage.setItem('eventhub_cached_events', JSON.stringify(filtered));
          } catch (e) { }
          return filtered;
        });
        setSelectedPastEvent((prev) => (String(prev?._id || prev?.id) === String(updated._id) ? null : prev));
        setSelectedDetailsEvent((prev) => (String(prev?._id || prev?.id) === String(updated._id) ? null : prev));
      } else if (updated._id) {
        setEvents((prev) => {
          const exists = prev.some((evt) => String(evt._id || evt.id) === String(updated._id));
          if (!exists) {
            showToast(
              `🔔 New Event Announced: "${updated.title}"! Check it out!`,
              'info',
              () => openEventDetails(updated),
              'View Event'
            );
            const updatedNotifs = addNotification({
              type: 'event',
              title: 'New Event Announced!',
              message: `"${updated.title}" has just been published for ${updated.location || 'TRACE'}. Register now!`,
              meta: { eventId: updated._id },
            });
            setNotifications(updatedNotifs);
          }
          const updatedList = exists
            ? prev.map((evt) => (String(evt._id || evt.id) === String(updated._id) ? { ...evt, ...updated } : evt))
            : [updated, ...prev];
          try {
            localStorage.setItem('eventhub_cached_events', JSON.stringify(updatedList));
            sessionStorage.setItem('eventhub_cached_events', JSON.stringify(updatedList));
          } catch (e) { }
          return updatedList;
        });
        setSelectedPastEvent((prev) =>
          String(prev?._id || prev?.id) === String(updated._id) ? { ...prev, ...updated } : prev
        );
        setSelectedDetailsEvent((prev) =>
          String(prev?._id || prev?.id) === String(updated._id) ? { ...prev, ...updated } : prev
        );
      }
      fetchEvents(true);
    };

    const handleBookingCreated = (e) => {
      const booking = e?.detail;
      if (!booking) return;
      const isAdmin = Boolean(
        currentUser?.isAdmin ||
        currentUser?.role === 'admin' ||
        currentUser?.role === 'super_admin' ||
        currentUser?.role === 'branch_admin' ||
        currentUser?.email === 'admin@trace.lk'
      );
      if (isAdmin) {
        showToast(
          `📥 New Space Booking: ${booking.name} requested "${booking.venueName || 'Workspace'}"!`,
          'info',
          () => {
            setActiveTab('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
          'Dashboard'
        );
      }
      const updatedNotifs = addNotification({
        type: 'booking',
        title: 'New Space Booking Inquiry',
        message: `${booking.name} requested "${booking.venueName || 'Workspace'}" (${booking.branch || 'TRACE'}). Ref: ${booking.bookingRef || 'Pending'}`,
        meta: { bookingRef: booking.bookingRef },
      });
      setNotifications(updatedNotifs);
    };

    const handleRegistrationCreated = (e) => {
      const reg = e?.detail;
      if (!reg) return;
      const isAdmin = Boolean(
        currentUser?.isAdmin ||
        currentUser?.role === 'admin' ||
        currentUser?.role === 'super_admin' ||
        currentUser?.role === 'branch_admin' ||
        currentUser?.email === 'admin@trace.lk'
      );
      if (isAdmin) {
        showToast(
          `🎟️ New Event Attendee: ${reg.name} registered for "${reg.eventTitle || 'Event'}"!`,
          'success',
          () => {
            setActiveTab('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
          'Registrations'
        );
      }
      const updatedNotifs = addNotification({
        type: 'registration',
        title: 'New Event Attendee Registered',
        message: `${reg.name} (${reg.email}) registered for "${reg.eventTitle || 'Event'}".`,
        meta: { ticketId: reg.ticketId, eventId: reg.eventId },
      });
      setNotifications(updatedNotifs);
    };

    const handleNotifUpdate = (e) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setNotifications(e.detail);
      } else {
        setNotifications(getStoredNotifications());
      }
    };

    const handleCustomEvent = (e) => applyLiveEventUpdate(e.detail);
    window.addEventListener('eventhub_events_updated', handleCustomEvent);
    window.addEventListener('eventhub_booking_created', handleBookingCreated);
    window.addEventListener('eventhub_registration_created', handleRegistrationCreated);
    window.addEventListener('eventhub_notifications_updated', handleNotifUpdate);

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('eventhub_channel');
        bc.onmessage = (msg) => {
          if (msg.data?.type === 'EVENT_UPDATED') {
            applyLiveEventUpdate(msg.data.detail);
          } else if (msg.data?.type === 'BOOKING_CREATED') {
            handleBookingCreated({ detail: msg.data.detail });
          } else if (msg.data?.type === 'REGISTRATION_CREATED') {
            handleRegistrationCreated({ detail: msg.data.detail });
          } else if (msg.data?.type === 'NOTIFICATIONS_UPDATED') {
            setNotifications(msg.data.list);
          }
        };
      } catch (err) { }
    }

    const handleStorage = (e) => {
      if (e.key === 'eventhub_last_event_update' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.detail) applyLiveEventUpdate(parsed.detail);
        } catch (err) { }
      } else if (e.key === 'eventhub_last_booking_create' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.detail) handleBookingCreated({ detail: parsed.detail });
        } catch (err) { }
      } else if (e.key === 'eventhub_last_registration_create' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.detail) handleRegistrationCreated({ detail: parsed.detail });
        } catch (err) { }
      } else if (e.key === 'eventhub_notifications_list' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setNotifications(parsed);
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleVenueCustomEvent = () => prefetchVenues();
    window.addEventListener('eventhub_venues_updated', handleVenueCustomEvent);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchEvents(true);
        prefetchVenues();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('eventhub_events_updated', handleCustomEvent);
      window.removeEventListener('eventhub_booking_created', handleBookingCreated);
      window.removeEventListener('eventhub_registration_created', handleRegistrationCreated);
      window.removeEventListener('eventhub_notifications_updated', handleNotifUpdate);
      window.removeEventListener('eventhub_venues_updated', handleVenueCustomEvent);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (bc) bc.close();
    };
  }, []);

  const showToast = (message, type = 'info', onAction = null, actionText = null) => {
    setToast({ visible: true, message, type, onAction, actionText });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'info', onAction: null, actionText: null });
    }, 5500);
  };

  const fetchEvents = async (silent = false) => {
    if (!silent && events.length === 0) {
      setLoading(true);
    }
    try {
      const response = await fetch('/api/events');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setEvents(result.data);
        try {
          localStorage.setItem('eventhub_cached_events', JSON.stringify(result.data));
          sessionStorage.setItem('eventhub_cached_events', JSON.stringify(result.data));
        } catch (e) { }
      } else if (!silent && events.length === 0) {
        showToast(result.message || 'Failed to load events', 'error');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      if (!silent && events.length === 0) showToast('Failed to connect to event server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const prefetchVenues = async () => {
    try {
      const res = await fetch('/api/venues');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        sessionStorage.setItem('eventhub_cached_venues', JSON.stringify(data.data));
      }
    } catch (e) { }
  };

  const checkAuthStatus = async (authToken) => {
    if (!authToken) {
      setCurrentUser(null);
      return;
    }
    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const result = await response.json();
      if (result.success && result.data) {
        setCurrentUser(result.data);
        const u = result.data;
        if (u.role === 'admin' || u.role === 'super_admin' || u.role === 'branch_admin' || u.email === 'admin@trace.lk' || u.isAdmin) {
          prefetchAdminData(authToken);
        }
      } else {
        setToken(null);
        setCurrentUser(null);
        localStorage.removeItem('eventhub_token');
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      setToken(null);
      setCurrentUser(null);
      localStorage.removeItem('eventhub_token');
    }
  };

  const prefetchAdminData = async (authToken) => {
    if (!authToken) return;
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      Promise.allSettled([
        fetch('/api/events', { headers }).then(r => r.json()).then(d => {
          if (d.success && Array.isArray(d.data)) {
            sessionStorage.setItem('eventhub_admin_cached_events', JSON.stringify(d.data));
            sessionStorage.setItem('eventhub_cached_events', JSON.stringify(d.data));
          }
        }),
        fetch('/api/registrations', { headers }).then(r => r.json()).then(d => {
          if (d.success && Array.isArray(d.data)) {
            sessionStorage.setItem('eventhub_admin_cached_registrations', JSON.stringify(d.data));
          }
        }),
        fetch('/api/venues', { headers }).then(r => r.json()).then(d => {
          if (d.success && Array.isArray(d.data)) {
            sessionStorage.setItem('eventhub_cached_venues', JSON.stringify(d.data));
          }
        }),
        fetch('/api/venue-bookings', { headers }).then(r => r.json()).then(d => {
          if (d.success && Array.isArray(d.data)) {
            sessionStorage.setItem('eventhub_admin_cached_bookings', JSON.stringify(d.data));
          }
        }),
        fetch('/api/auth/users', { headers }).then(r => r.json()).then(d => {
          if (d.success && Array.isArray(d.data)) {
            sessionStorage.setItem('eventhub_admin_cached_users', JSON.stringify(d.data));
          }
        }),
      ]);
    } catch (e) { }
  };

  useEffect(() => {
    fetchEvents(events.length > 0);
    prefetchVenues();
    checkAuthStatus(token);
  }, []);

  const handleAuthSuccess = (data, isAdminUser = false) => {
    setToken(data.token);
    setCurrentUser(data.user);
    localStorage.setItem('eventhub_token', data.token);

    const user = data.user;
    const isAdmin = Boolean(
      isAdminUser ||
      user?.role === 'admin' ||
      user?.role === 'super_admin' ||
      user?.role === 'branch_admin' ||
      user?.email === 'admin@trace.lk' ||
      user?.isAdmin
    );

    if (isAdmin) {
      prefetchAdminData(data.token);
      setActiveTab('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const promptLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('eventhub_token');
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Logged out successfully.', 'info');
  };

  const openEventDetails = (evt) => {
    setSelectedDetailsEvent(evt);
    if (evt?._id) {
      sessionStorage.setItem('eventhub_details_event_id', evt._id);
      setActiveTab('event-details', evt._id);
    } else {
      setActiveTab('event-details');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToHero = () => {
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToEvents = (tabName = 'upcoming') => {
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const focusSearch = () => {
    scrollToEvents('upcoming');
    setTimeout(() => {
      const input = document.getElementById('filter-search') || document.getElementById('search-input');
      if (input) input.focus();
    }, 100);
  };

  const handleNotificationClick = async (notif) => {
    if (!notif) return;
    if (notif.meta?.eventId) {
      let targetEvt = events.find((e) => String(e._id || e.id) === String(notif.meta.eventId));
      if (!targetEvt) {
        try {
          const res = await fetch(`/api/events/${notif.meta.eventId}`);
          const d = await res.json();
          if (d.success && d.data) targetEvt = d.data;
        } catch (err) {}
      }
      if (targetEvt) {
        openEventDetails(targetEvt);
        return;
      }
      setActiveTab('upcoming');
      return;
    }

    if (notif.meta?.bookingRef || notif.type === 'booking') {
      const isAdmin = Boolean(
        currentUser?.isAdmin ||
        currentUser?.role === 'admin' ||
        currentUser?.role === 'super_admin' ||
        currentUser?.role === 'branch_admin' ||
        currentUser?.email === 'admin@trace.lk'
      );
      if (isAdmin) {
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setActiveTab('venues-page');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (notif.type === 'registration') {
      const isAdmin = Boolean(
        currentUser?.isAdmin ||
        currentUser?.role === 'admin' ||
        currentUser?.role === 'super_admin' ||
        currentUser?.role === 'branch_admin' ||
        currentUser?.email === 'admin@trace.lk'
      );
      if (isAdmin) {
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setActiveTab('my-events');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (notif.type === 'reminder') {
      setActiveTab('my-events');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const checkUpcomingEventReminders = async (user) => {
    if (!user?.email) return;
    const sessionKey = `eventhub_reminded_check_${user.email}`;
    if (sessionStorage.getItem(sessionKey)) return;

    try {
      const res = await fetch(`/api/registrations/user/${encodeURIComponent(user.email.trim())}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        for (const reg of data.data) {
          const evt = reg.eventId;
          if (!evt || typeof evt !== 'object' || !evt.date) continue;
          const evtDateStr =
            typeof evt.date === 'string'
              ? evt.date.split('T')[0]
              : new Date(evt.date).toISOString().split('T')[0];

          const isToday = evtDateStr === todayStr;
          const isTomorrow = evtDateStr === tomorrowStr;

          if (isToday || isTomorrow) {
            const timeLabel = isToday ? 'TODAY' : 'TOMORROW';
            showToast(
              `⏰ Event Reminder: "${evt.title}" is happening ${timeLabel} at ${evt.time || '10:00 AM'}!`,
              'warning',
              () => openEventDetails(evt),
              'View Event'
            );
            const updatedNotifs = addNotification({
              type: 'reminder',
              title: `Upcoming Event (${timeLabel})`,
              message: `Reminder: You have registered for "${evt.title}" happening ${timeLabel} at ${evt.time || 'scheduled time'} (${evt.location || 'TRACE'}).`,
              meta: { eventId: evt._id },
            });
            setNotifications(updatedNotifs);
            break;
          }
        }
        sessionStorage.setItem(sessionKey, 'true');
      }
    } catch (err) {
      console.warn('Upcoming reminder check notice:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.email) {
      checkUpcomingEventReminders(currentUser);
    }
  }, [currentUser]);

  const hideHeaderFooter = activeTab === 'event-details' || activeTab === 'admin';

  return (
    <div className="app-root">
      {!hideHeaderFooter && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          scrollToHero={scrollToHero}
          scrollToEvents={scrollToEvents}
          focusSearch={focusSearch}
          currentUser={currentUser}
          logout={promptLogout}
          openLoginModal={() => setShowLogin(true)}
          openSignupModal={() => setShowSignup(true)}
          openAdminModal={() => {
            setActiveTab('admin');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          openMyRegistrationsModal={() => {
            setActiveTab('my-events');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      <main
        className={`main-content ${activeTab === 'home'
          ? 'is-home'
          : hideHeaderFooter
            ? 'no-nav-offset'
            : 'has-nav-offset'
          }`}
      >
        {activeTab === 'home' && (
          <>
            <HeroSection
              scrollToEvents={scrollToEvents}
              onNavigateSpaces={() => {
                setActiveTab('venues-page');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <WhyJoinSection />
            <UpcomingEventsSection
              events={events}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={loading}
              openRegistrationModal={openEventDetails}
              openGalleryLightbox={(evt, index) => setLightboxData({ event: evt, index })}
            />
            <PastEventsSection
              events={events}
              setActiveTab={setActiveTab}
              onSelectPastEvent={(evt) => {
                setSelectedPastEvent(evt);
                if (evt?._id) {
                  sessionStorage.setItem('eventhub_past_event_id', evt._id);
                  setActiveTab('past-details', evt._id);
                } else {
                  setActiveTab('past-details');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}

        {activeTab === 'upcoming' && (
          <UpcomingEventsPage
            events={events}
            loading={loading}
            openRegistrationModal={openEventDetails}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'past' && (
          <PastEventsSection
            events={events}
            loading={loading}
            setActiveTab={setActiveTab}
            isFullView={true}
            onSelectPastEvent={(evt) => {
              setSelectedPastEvent(evt);
              if (evt?._id) {
                sessionStorage.setItem('eventhub_past_event_id', evt._id);
                setActiveTab('past-details', evt._id);
              } else {
                setActiveTab('past-details');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        <React.Suspense
          fallback={
            <div style={{ padding: '5rem 0', textAlign: 'center', color: '#6366f1' }}>
              <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'block' }}></i>
              <span style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>Loading view...</span>
            </div>
          }
        >
          {activeTab === 'past-details' && (
            <PastEventDetailsPage
              event={selectedPastEvent}
              onBack={() => setActiveTab('past')}
              showToast={showToast}
              onOpenGalleryLightbox={(evt, index) => setLightboxData({ event: evt, index })}
            />
          )}

          {activeTab === 'event-details' && (
            <EventDetailsPage
              event={selectedDetailsEvent}
              onBack={() => setActiveTab('upcoming')}
              currentUser={currentUser}
              onRegistrationSuccess={(data) => {
                fetchEvents();
              }}
              onOpenMyEvents={() => setActiveTab('my-events')}
              onOpenCalendar={() => {
                setActiveTab('calendar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'my-events' && (
            <MyEventsPage
              currentUser={currentUser}
              onViewEvent={openEventDetails}
              onOpenCalendar={() => {
                setActiveTab('calendar');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              showToast={showToast}
              openLoginModal={() => setShowLogin(true)}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              token={token}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              logout={promptLogout}
              showToast={showToast}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarPage
              currentUser={currentUser}
              onSelectEvent={openEventDetails}
              onOpenUpcoming={() => setActiveTab('upcoming')}
              showToast={showToast}
              openLoginModal={() => setShowLogin(true)}
            />
          )}

          {activeTab === 'venues-page' && (
            <VenuesPage showToast={showToast} />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardPage
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              token={token}
              setToken={setToken}
              logout={promptLogout}
              openCreateEventModal={() => setShowAdmin(true)}
              showToast={showToast}
              onEventUpdated={(updatedEvent) => {
                if (updatedEvent?._id) {
                  setEvents((prev) =>
                    prev.map((e) => (e._id === updatedEvent._id ? { ...e, ...updatedEvent } : e))
                  );
                  setSelectedPastEvent((prev) =>
                    prev?._id === updatedEvent._id ? { ...prev, ...updatedEvent } : prev
                  );
                  setSelectedDetailsEvent((prev) =>
                    prev?._id === updatedEvent._id ? { ...prev, ...updatedEvent } : prev
                  );
                }
                fetchEvents();
              }}
              onEventCreated={(newEvent) => {
                if (newEvent?._id) {
                  setEvents((prev) => [newEvent, ...prev.filter((e) => e._id !== newEvent._id)]);
                }
                fetchEvents();
              }}
              onEventDeleted={(deletedId) => {
                if (deletedId) {
                  setEvents((prev) => prev.filter((e) => e._id !== deletedId));
                }
                fetchEvents();
              }}
            />
          )}
        </React.Suspense>
      </main>

      {!hideHeaderFooter && <Footer setActiveTab={setActiveTab} />}

      {/* Modals - Async Lazy-Loaded and Conditionally Mounted */}
      <React.Suspense fallback={null}>
        {Boolean(regEvent) && (
          <RegistrationModal
            isOpen={true}
            onClose={() => setRegEvent(null)}
            event={regEvent}
            currentUser={currentUser}
            onSuccess={(data) => {
              setConfData(data);
              fetchEvents(); // refresh counts
            }}
            showToast={showToast}
          />
        )}

        {Boolean(confData) && (
          <ConfirmationModal
            isOpen={true}
            onClose={() => setConfData(null)}
            registrationData={confData}
            showToast={showToast}
          />
        )}

        {Boolean(lightboxData) && (
          <LightboxModal
            isOpen={true}
            onClose={() => setLightboxData(null)}
            event={lightboxData?.event}
            initialIndex={lightboxData?.index || 0}
          />
        )}

        {showMyRegs && (
          <MyRegistrationsModal
            isOpen={true}
            onClose={() => setShowMyRegs(false)}
            showToast={showToast}
          />
        )}

        {showAdmin && (
          <AdminModal
            isOpen={true}
            onClose={() => setShowAdmin(false)}
            onEventCreated={fetchEvents}
            showToast={showToast}
          />
        )}

        {showLogin && (
          <LoginModal
            isOpen={true}
            onClose={() => setShowLogin(false)}
            onLoginSuccess={handleAuthSuccess}
            initialEmail={loginPrefillEmail}
            openForgotPassword={(prefillEmail) => {
              setShowLogin(false);
              setForgotPasswordEmail(prefillEmail || '');
              setShowForgotPassword(true);
            }}
            switchToSignup={() => {
              setShowLogin(false);
              setShowSignup(true);
            }}
            showToast={showToast}
          />
        )}

        {showForgotPassword && (
          <ForgotPasswordModal
            isOpen={true}
            onClose={() => setShowForgotPassword(false)}
            initialEmail={forgotPasswordEmail}
            switchToLogin={(prefillEmail) => {
              setShowForgotPassword(false);
              setLoginPrefillEmail(prefillEmail || '');
              setShowLogin(true);
            }}
            showToast={showToast}
          />
        )}

        {showSignup && (
          <SignupModal
            isOpen={true}
            onClose={() => setShowSignup(false)}
            onSignupSuccess={handleAuthSuccess}
            switchToLogin={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
            showToast={showToast}
          />
        )}

        {showLogoutConfirm && (
          <LogoutConfirmModal
            isOpen={true}
            onClose={() => setShowLogoutConfirm(false)}
            onConfirm={confirmLogout}
            userName={currentUser?.name}
          />
        )}

        {/* Global AI Chatbot Agent */}
        <ChatbotAgent currentUser={currentUser} setActiveTab={setActiveTab} events={events} />
      </React.Suspense>

      {/* Global Interactive Toast Notification Container */}
      <ToastNotification toast={toast} />
    </div>
  );
}
