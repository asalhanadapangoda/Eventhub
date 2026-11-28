import React, { useState, useEffect, useRef } from 'react';
import { notifyEventUpdated, notifyVenueUpdated, optimizeImageUrl, DEFAULT_EVENT_BANNER, PRESET_BRANCHES, getSpaceTypes, getSpaceTypeIcon, AVAILABLE_SPACE_TYPES, isWesternSpace } from '../utils/eventUtils';
import { cachedFetchJson } from '../../../common/apiCache';

const EditEventModal = React.lazy(() => import('./modals/EditEventModal'));
const AddVenueModal = React.lazy(() => import('./modals/AddVenueModal'));
const CreateEventPage = React.lazy(() => import('./CreateEventPage'));
const CloudinaryUploader = React.lazy(() => import('./CloudinaryUploader'));
const AdminHeroTab = React.lazy(() => import('./admin/AdminHeroTab'));
const AdminRegistrationsTab = React.lazy(() => import('./admin/AdminRegistrationsTab'));
const AdminUsersTab = React.lazy(() => import('./admin/AdminUsersTab'));
const AdminVenuesTab = React.lazy(() => import('./admin/AdminVenuesTab'));
const AdminInquiriesTab = React.lazy(() => import('./admin/AdminInquiriesTab'));
const AdminUserModals = React.lazy(() => import('./admin/AdminUserModals'));

export default function AdminDashboardPage({
  currentUser,
  setCurrentUser,
  token,
  setToken,
  logout,
  openCreateEventModal,
  showToast,
  onEventUpdated,
  onEventCreated,
  onEventDeleted,
}) {
  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard Data & Navigation State (Pre-populated from cache for instant 0ms load)
  const [events, setEvents] = useState(() => {
    try {
      const cached = sessionStorage.getItem('eventhub_admin_cached_events') || sessionStorage.getItem('eventhub_cached_events');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [registrations, setRegistrations] = useState(() => {
    try {
      const cached = sessionStorage.getItem('eventhub_admin_cached_registrations');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const hasEvents = sessionStorage.getItem('eventhub_admin_cached_events') || sessionStorage.getItem('eventhub_cached_events');
      const hasRegs = sessionStorage.getItem('eventhub_admin_cached_registrations');
      return !(hasEvents || hasRegs);
    } catch (e) {
      return true;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [eventTab, setEventTab] = useState('all'); // 'all', 'upcoming', 'past'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [eventDateFilter, setEventDateFilter] = useState('');
  const dateInputRef = useRef(null);

  // Hero Banner Settings State (Defaults to original TRACE video & text)
  const DEFAULT_HERO_SETTINGS = {
    heroMediaType: 'default',
    heroImageUrl: '',
    heroImages: [],
    heroVideoUrl: '',
    heroBadge: 'TRACE COMMUNITY HUB, SRI LANKA',
    heroTitle: 'Where innovation meets community and culture.',
    heroSubtitle:
      "Be part of Sri Lanka's largest innovation ecosystem to make an impact.",
  };

  const [heroSettings, setHeroSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('eventhub_hero_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.heroImageUrl === '/home.jpeg' || parsed.heroTitle === 'Where Innovation Meets Community and Creativity.') {
          return DEFAULT_HERO_SETTINGS;
        }
        return parsed;
      }
      return DEFAULT_HERO_SETTINGS;
    } catch (e) {
      return DEFAULT_HERO_SETTINGS;
    }
  });
  const [savingHeroSettings, setSavingHeroSettings] = useState(false);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [uploadingHeroPhotos, setUploadingHeroPhotos] = useState(false);
  const [heroMockupSlideIndex, setHeroMockupSlideIndex] = useState(0);
  const heroPhotosFileInputRef = useRef(null);

  // Registrations View State
  const [regEventFilter, setRegEventFilter] = useState('all');
  const [regStatusFilter, setRegStatusFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState(null);
  const [editingRegStatus, setEditingRegStatus] = useState('Confirmed');
  const [editingRegNotes, setEditingRegNotes] = useState('');
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [savingReg, setSavingReg] = useState(false);

  // Event Edit Modal State
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingVenue, setEditingVenue] = useState(null);

  // Registered Users & Branch Admins State
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const cached = sessionStorage.getItem('eventhub_admin_cached_users');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all', 'admins', 'users'
  const [showAddBranchAdminModal, setShowAddBranchAdminModal] = useState(false);
  const [editingAdminUser, setEditingAdminUser] = useState(null);
  const [editingAdminForm, setEditingAdminForm] = useState({
    name: '',
    branch: 'TRACE Expert City Colombo 10',
    permissions: ['manage_events', 'manage_registrations'],
    avatar: '',
  });
  const [isCustomEditAdminBranch, setIsCustomEditAdminBranch] = useState(false);
  const [savingAdminEdit, setSavingAdminEdit] = useState(false);

  const [branchAdminForm, setBranchAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: 'TRACE Expert City Colombo 10',
    permissions: ['manage_events', 'manage_registrations'],
  });
  const [isCustomBranchAdmin, setIsCustomBranchAdmin] = useState(false);
  const [emailNotificationModalData, setEmailNotificationModalData] = useState(null);
  const [submittingBranchAdmin, setSubmittingBranchAdmin] = useState(false);

  const handleSaveAdminEdit = async (e) => {
    e.preventDefault();
    if (!editingAdminUser) return;
    setSavingAdminEdit(true);
    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const res = await fetch(`/api/auth/users/${editingAdminUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(editingAdminForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegisteredUsers((prev) =>
          prev.map((u) => (u._id === editingAdminUser._id ? { ...u, ...data.data } : u))
        );
        setEditingAdminUser(null);
        if (showToast) showToast(`Admin details for "${editingAdminForm.name}" updated successfully!`, 'success');
      } else {
        if (showToast) showToast(data.message || 'Failed to update admin details', 'error');
      }
    } catch (err) {
      if (showToast) showToast('Failed to connect to server', 'error');
    } finally {
      setSavingAdminEdit(false);
    }
  };

  const handleCreateBranchAdmin = async (e) => {
    e.preventDefault();
    if (!branchAdminForm.name || !branchAdminForm.email || !branchAdminForm.password) {
      if (showToast) showToast('Please enter Name, Email, and Password.', 'error');
      return;
    }

    setSubmittingBranchAdmin(true);
    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const res = await fetch('/api/auth/create-branch-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(branchAdminForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowAddBranchAdminModal(false);
        if (showToast) showToast(data.message, 'success');

        // Show Email Dispatch Notification Modal to Admin
        setEmailNotificationModalData(data.emailNotification);

        // Refresh registered users list
        fetchDashboardData();

        // Reset form
        setBranchAdminForm({
          name: '',
          email: '',
          password: '',
          branch: 'TRACE Expert City Colombo 10',
          permissions: ['manage_events', 'manage_registrations'],
        });
        setIsCustomBranchAdmin(false);
      } else {
        if (showToast) showToast(data.message || 'Failed to assign branch admin', 'error');
      }
    } catch (err) {
      console.error('Error creating branch admin:', err);
      if (showToast) showToast('Network error creating branch admin', 'error');
    } finally {
      setSubmittingBranchAdmin(false);
    }
  };

  const handleSendEmailCredentials = async (user) => {
    if (showToast) showToast(`Dispatching credentials email to ${user.email}...`, 'info');
    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const res = await fetch('/api/auth/send-credentials-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ userId: user._id, email: user.email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (showToast) showToast(`Credentials email dispatched to ${user.email}!`, 'success');
        setEmailNotificationModalData(data.emailNotification);
      } else {
        if (showToast) showToast(data.message || 'Failed to send credentials email', 'error');
      }
    } catch (err) {
      console.error('Error sending credentials email:', err);
      if (showToast) showToast('Network error sending email', 'error');
    }
  };

  // Venues State (Pre-populated from cache for instant 0ms load)
  const [venues, setVenues] = useState(() => {
    try {
      const cached = sessionStorage.getItem('eventhub_cached_venues');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [showAddVenueModal, setShowAddVenueModal] = useState(false);
  const [venueBookings, setVenueBookings] = useState(() => {
    try {
      const cached = sessionStorage.getItem('eventhub_admin_cached_bookings');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [inquirySearchQuery, setInquirySearchQuery] = useState('');
  const [inquiryBranchFilter, setInquiryBranchFilter] = useState('all');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('all');
  const [venueSearchQuery, setVenueSearchQuery] = useState('');
  const [venueBranchFilter, setVenueBranchFilter] = useState('all');
  const [venueStatusFilter, setVenueStatusFilter] = useState('all');
  const [venueTypeFilter, setVenueTypeFilter] = useState('all');
  const [venueCapacityFilter, setVenueCapacityFilter] = useState('all');
  const [sidebarHidden, setSidebarHidden] = useState(false);

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'branch_admin' || currentUser.email === 'admin@trace.lk' || currentUser.isAdmin);

  const fetchDashboardData = async (silent = false, bustCache = true) => {
    // Only show blocking spinner if cache is completely empty
    if (!silent && events.length === 0 && registrations.length === 0) {
      setLoading(true);
    }

    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

      // Execute all 6 dashboard fetches in parallel for instant 0ms/fast load
      const [eventsResult, regsResult, venuesResult, bookingsResult, usersResult, heroResult] =
        await Promise.allSettled([
          cachedFetchJson('/api/events', { headers, ttlMs: 30000, bustCache }),
          cachedFetchJson('/api/registrations', { headers, ttlMs: 15000, bustCache }),
          cachedFetchJson('/api/venues', { headers, ttlMs: 30000, bustCache }),
          cachedFetchJson('/api/venue-bookings', { headers, ttlMs: 15000, bustCache }),
          cachedFetchJson('/api/auth/users', { headers, ttlMs: 15000, bustCache }),
          cachedFetchJson('/api/settings/hero', { ttlMs: 60000 }),
        ]);

      // 1. Events
      if (eventsResult.status === 'fulfilled' && eventsResult.value?.success) {
        const data = eventsResult.value.data || [];
        setEvents(data);
        try {
          sessionStorage.setItem('eventhub_admin_cached_events', JSON.stringify(data));
          sessionStorage.setItem('eventhub_cached_events', JSON.stringify(data));
        } catch (e) { }
      }

      // 2. Registrations
      if (regsResult.status === 'fulfilled' && regsResult.value?.success) {
        const data = regsResult.value.data || [];
        setRegistrations(data);
        try {
          sessionStorage.setItem('eventhub_admin_cached_registrations', JSON.stringify(data));
        } catch (e) { }
      }

      // 3. Venues
      if (venuesResult.status === 'fulfilled' && venuesResult.value?.success) {
        const data = venuesResult.value.data || [];
        if (data.length > 0) {
          setVenues(data);
          try {
            sessionStorage.setItem('eventhub_cached_venues', JSON.stringify(data));
          } catch (e) { }
        }
      }

      // 4. Venue Booking Inquiries
      if (bookingsResult.status === 'fulfilled' && bookingsResult.value?.success) {
        const data = bookingsResult.value.data || [];
        setVenueBookings(data);
        try {
          sessionStorage.setItem('eventhub_admin_cached_bookings', JSON.stringify(data));
        } catch (e) { }
      }

      // 5. Registered Users
      if (usersResult.status === 'fulfilled' && usersResult.value?.success) {
        const data = usersResult.value.data || [];
        setRegisteredUsers(data);
        try {
          sessionStorage.setItem('eventhub_admin_cached_users', JSON.stringify(data));
        } catch (e) { }
      }

      // 6. Hero Settings
      if (heroResult.status === 'fulfilled' && heroResult.value?.success && heroResult.value?.data) {
        setHeroSettings(heroResult.value.data);
        try {
          localStorage.setItem('eventhub_hero_settings', JSON.stringify(heroResult.value.data));
        } catch (e) { }
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHeroSettings = async (customPayload = null) => {
    const toSave = customPayload || heroSettings;
    setSavingHeroSettings(true);
    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const res = await fetch('/api/settings/hero', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setHeroSettings(data.data);
        localStorage.setItem('eventhub_hero_settings', JSON.stringify(data.data));
        window.dispatchEvent(new CustomEvent('hero_settings_updated', { detail: data.data }));
        if (showToast) showToast('Hero section banner updated & published live!', 'success');
      } else {
        if (showToast) showToast(data.message || 'Failed to update hero settings', 'error');
      }
    } catch (err) {
      console.error('Save hero settings error:', err);
      // Fallback local persistence so it always works immediately
      localStorage.setItem('eventhub_hero_settings', JSON.stringify(toSave));
      window.dispatchEvent(new CustomEvent('hero_settings_updated', { detail: toSave }));
      if (showToast) showToast('Hero settings saved and applied locally!', 'success');
    } finally {
      setSavingHeroSettings(false);
    }
  };

  // Multiple hero photos list derived from heroImages (up to 10 photos)
  const heroPhotosList = (Array.isArray(heroSettings.heroImages) && heroSettings.heroImages.length > 0)
    ? heroSettings.heroImages.filter(Boolean)
    : (heroSettings.heroImageUrl ? [heroSettings.heroImageUrl] : []);

  // Admin mockup preview slider
  useEffect(() => {
    if (heroSettings.heroMediaType === 'image' && heroPhotosList.length > 1) {
      const timer = setInterval(() => {
        setHeroMockupSlideIndex((prev) => (prev + 1) % heroPhotosList.length);
      }, 3500);
      return () => clearInterval(timer);
    }
  }, [heroSettings.heroMediaType, heroPhotosList.length]);

  useEffect(() => {
    if (heroMockupSlideIndex >= heroPhotosList.length) {
      setHeroMockupSlideIndex(0);
    }
  }, [heroPhotosList.length]);

  // Upload multiple hero photos from computer (up to 10)
  const handleUploadHeroPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImages = (Array.isArray(heroSettings.heroImages) && heroSettings.heroImages.length > 0)
      ? [...heroSettings.heroImages.filter(Boolean)]
      : (heroSettings.heroImageUrl ? [heroSettings.heroImageUrl] : []);

    const remainingSlots = 10 - currentImages.length;
    if (remainingSlots <= 0) {
      if (showToast) showToast('Maximum 10 photos already reached. Remove a photo to add a new one.', 'warning');
      if (e.target) e.target.value = '';
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (files.length > remainingSlots && showToast) {
      showToast(`Selected ${files.length} files, but only ${remainingSlots} photo slot(s) remaining (Maximum 10).`, 'info');
    }

    setUploadingHeroPhotos(true);
    const token = localStorage.getItem('eventhub_token');

    try {
      const uploadedUrls = [];
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const json = await res.json();
        if (json.success && json.data?.url) {
          uploadedUrls.push(json.data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        const updatedImages = [...currentImages, ...uploadedUrls].slice(0, 10);
        const updated = {
          ...heroSettings,
          heroMediaType: 'image',
          heroImages: updatedImages,
          heroImageUrl: updatedImages[0] || '',
        };
        setHeroSettings(updated);
        handleSaveHeroSettings(updated);
        if (showToast) showToast(`Successfully uploaded ${uploadedUrls.length} photo(s) to hero slideshow!`, 'success');
      } else {
        if (showToast) showToast('Failed to upload photos. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error uploading hero photos:', err);
      if (showToast) showToast('Network error during photo upload.', 'error');
    } finally {
      setUploadingHeroPhotos(false);
      if (e.target) e.target.value = '';
    }
  };

  // Add photo via direct URL
  const handleAddHeroPhotoUrl = () => {
    if (!newPhotoUrlInput || !newPhotoUrlInput.trim()) return;
    const url = newPhotoUrlInput.trim();
    const currentImages = (Array.isArray(heroSettings.heroImages) && heroSettings.heroImages.length > 0)
      ? [...heroSettings.heroImages.filter(Boolean)]
      : (heroSettings.heroImageUrl ? [heroSettings.heroImageUrl] : []);

    if (currentImages.length >= 10) {
      if (showToast) showToast('Maximum 10 photos reached. Please remove one before adding another.', 'warning');
      return;
    }

    const updatedImages = [...currentImages, url].slice(0, 10);
    const updated = {
      ...heroSettings,
      heroMediaType: 'image',
      heroImages: updatedImages,
      heroImageUrl: updatedImages[0] || '',
    };
    setHeroSettings(updated);
    setNewPhotoUrlInput('');
    handleSaveHeroSettings(updated);
    if (showToast) showToast('Photo added to hero slideshow!', 'success');
  };

  // Remove individual photo from slideshow
  const handleRemoveHeroPhoto = (indexToRemove) => {
    const currentImages = (Array.isArray(heroSettings.heroImages) && heroSettings.heroImages.length > 0)
      ? [...heroSettings.heroImages.filter(Boolean)]
      : (heroSettings.heroImageUrl ? [heroSettings.heroImageUrl] : []);

    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    const updated = {
      ...heroSettings,
      heroImages: updatedImages,
      heroImageUrl: updatedImages[0] || '',
      heroMediaType: updatedImages.length > 0 ? 'image' : 'default',
    };
    setHeroSettings(updated);
    handleSaveHeroSettings(updated);
    if (showToast) showToast('Photo removed from slideshow.', 'info');
  };

  // Reorder photos (move earlier/later)
  const handleMoveHeroPhoto = (fromIndex, toIndex) => {
    const currentImages = (Array.isArray(heroSettings.heroImages) && heroSettings.heroImages.length > 0)
      ? [...heroSettings.heroImages.filter(Boolean)]
      : (heroSettings.heroImageUrl ? [heroSettings.heroImageUrl] : []);

    if (toIndex < 0 || toIndex >= currentImages.length) return;
    const item = currentImages[fromIndex];
    currentImages.splice(fromIndex, 1);
    currentImages.splice(toIndex, 0, item);

    const updated = {
      ...heroSettings,
      heroImages: currentImages,
      heroImageUrl: currentImages[0] || '',
    };
    setHeroSettings(updated);
    handleSaveHeroSettings(updated);
  };

  useEffect(() => {
    if (isAdmin) {
      const hasCached = events.length > 0 || registrations.length > 0;
      fetchDashboardData(hasCached);
    }
  }, [isAdmin]);

  // Sync state when a registration is selected for the slide-over drawer
  useEffect(() => {
    if (selectedReg) {
      setEditingRegStatus(selectedReg.status || 'Confirmed');
      setEditingRegNotes(selectedReg.notes || 'Requested vegetarian meal option for the networking dinner.');
      setIsChangingStatus(false);
      setIsEditingNotes(false);
    }
  }, [selectedReg]);

  // Handle Admin Security Login Submission
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const result = await response.json();

      if (result.success) {
        const user = result.data.user;
        const authToken = result.data.token;

        const allowedAdminRoles = ['admin', 'super_admin', 'branch_admin'];
        if (!allowedAdminRoles.includes(user.role) && user.email !== 'admin@trace.lk' && !user.isAdmin) {
          if (showToast) {
            showToast('Access denied. Account does not have admin privileges.', 'error');
          }
          setLoggingIn(false);
          return;
        }

        // Store Admin Auth State
        localStorage.setItem('eventhub_token', authToken);
        if (setToken) setToken(authToken);
        if (setCurrentUser) setCurrentUser(user);

        if (showToast) {
          showToast(`Welcome back to Admin Portal, ${user.name}!`, 'success');
        }
      } else {
        if (showToast) {
          showToast(result.message || 'Invalid admin credentials.', 'error');
        }
      }
    } catch (err) {
      console.error('Admin login error:', err);
      if (showToast) showToast('Network error during admin login.', 'error');
    } finally {
      setLoggingIn(false);
    }
  };

  // Delete Event Handler
  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?`)) {
      return;
    }

    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });
      const result = await response.json();

      if (result.success) {
        if (showToast) showToast(`"${eventTitle}" deleted from MongoDB`, 'success');
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
        if (onEventDeleted) onEventDeleted(eventId);
        notifyEventUpdated({ _id: eventId, deleted: true });
        fetchDashboardData();
      } else {
        if (showToast) showToast(result.message || 'Failed to delete event', 'error');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      if (showToast) showToast('Network error deleting event', 'error');
    }
  };

  // Duplicate Event Handler
  const handleDuplicateEvent = async (evt) => {
    try {
      const cloned = {
        ...evt,
        _id: undefined,
        title: `${evt.title} (Copy)`,
        registeredCount: 0,
        createdAt: undefined,
      };

      const authToken = localStorage.getItem('eventhub_token') || token;
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(cloned),
      });

      const result = await response.json();
      if (result.success) {
        if (showToast) showToast(`Duplicated "${evt.title}" successfully!`, 'success');
        if (result.data) {
          setEvents((prev) => [result.data, ...prev]);
          if (onEventCreated) onEventCreated(result.data);
          notifyEventUpdated(result.data);
        }
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error duplicating event:', err);
    }
  };

  // Save Registration Changes Handler (Update Status & Notes in MongoDB)
  const handleSaveRegistrationChanges = async () => {
    if (!selectedReg) return;
    setSavingReg(true);

    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const response = await fetch(`/api/registrations/${selectedReg._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          status: editingRegStatus,
          notes: editingRegNotes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (showToast) showToast('Registration status updated successfully!', 'success');
        const updatedReg = result.data || {
          ...selectedReg,
          status: editingRegStatus,
          notes: editingRegNotes,
        };

        setSelectedReg(updatedReg);
        setIsChangingStatus(false);
        setIsEditingNotes(false);

        // Update local registrations list state immediately
        setRegistrations((prevRegs) =>
          prevRegs.map((r) => (r._id === updatedReg._id ? { ...r, ...updatedReg } : r))
        );

        fetchDashboardData();
      } else {
        if (showToast) showToast(result.message || 'Failed to update registration', 'error');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      if (showToast) showToast('Network error updating registration', 'error');
    } finally {
      setSavingReg(false);
    }
  };

  // Direct Inline Status Change Handler for Registration Tables
  const handleDirectStatusChange = async (regId, newStatus) => {
    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const response = await fetch(`/api/registrations/${regId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        if (showToast) showToast(`Registration status updated to "${newStatus}"!`, 'success');

        setRegistrations((prevRegs) =>
          prevRegs.map((r) => (r._id === regId ? { ...r, status: newStatus } : r))
        );

        if (selectedReg && selectedReg._id === regId) {
          setSelectedReg((prev) => ({ ...prev, status: newStatus }));
          setEditingRegStatus(newStatus);
        }
      } else {
        if (showToast) showToast(result.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      console.error('Error changing registration status:', err);
      if (showToast) showToast('Network error updating registration status', 'error');
    }
  };

  // Copy to Clipboard helper
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    if (showToast) showToast(`Copied ${text} to clipboard!`, 'info');
  };

  // Get Initials for Avatar Circle
  const getInitials = (nameStr) => {
    if (!nameStr) return 'SJ';
    const parts = nameStr.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameStr.substring(0, 2).toUpperCase();
  };

  // If not logged in as Admin, show Security Login Screen
  if (!isAdmin) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-badge">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <h2>TRACE Admin Portal</h2>
          <p className="admin-login-sub">
            Please log in with administrator credentials to access the Event Management Dashboard.
          </p>

          <form onSubmit={handleAdminLogin} autoComplete="off">
            <div className="profile-form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="admin-email-input">Admin Email Address</label>
              <input
                type="email"
                id="admin-email-input"
                autoComplete="off"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@trace.lk"
              />
            </div>

            <div className="profile-form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="admin-password-input">Admin Password</label>
              <input
                type="password"
                id="admin-password-input"
                autoComplete="new-password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>



            <button
              type="submit"
              className="btn-save-changes-blue"
              style={{ width: '100%' }}
              disabled={loggingIn}
            >
              {loggingIn ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                'Log In as Admin'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Statistics Calculations
  const totalEventsCount = events.length;
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const upcomingCount = upcomingEvents.length;
  const pastEvents = events.filter((e) => e.status === 'past');
  const pastCount = pastEvents.length;
  const totalRegsCount = registrations.length;
  const confirmedRegsCount = registrations.filter((r) => (r.status || 'Confirmed') === 'Confirmed').length;

  // Filter Events logic for Manage Events Page
  const displayedEvents = events.filter((evt) => {
    if (eventTab === 'upcoming' && evt.status !== 'upcoming') return false;
    if (eventTab === 'past' && evt.status !== 'past') return false;
    if (statusFilter !== 'all' && evt.status !== statusFilter) return false;
    if (eventDateFilter) {
      try {
        const [selY, selM, selD] = eventDateFilter.split('-').map(Number);
        const evtD = new Date(evt.date);
        if (
          evtD.getFullYear() !== selY ||
          evtD.getMonth() + 1 !== selM ||
          evtD.getDate() !== selD
        ) {
          return false;
        }
      } catch (e) {
        // ignore date parse issues
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q) ||
        (evt.category && evt.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filter Registrations logic for Registrations Page
  const displayedRegistrations = registrations.filter((reg) => {
    if (regEventFilter !== 'all' && reg.eventTitle !== regEventFilter) return false;
    if (regStatusFilter !== 'all' && (reg.status || 'Confirmed') !== regStatusFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        reg.name.toLowerCase().includes(q) ||
        reg.email.toLowerCase().includes(q) ||
        (reg.contactNumber && reg.contactNumber.toLowerCase().includes(q)) ||
        (reg.eventTitle && reg.eventTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Export Registrations to Excel (CSV with UTF-8 BOM)
  const handleExportExcel = () => {
    if (!displayedRegistrations || displayedRegistrations.length === 0) {
      if (showToast) showToast('No registration data available to export.', 'warning');
      return;
    }

    const headers = [
      '#',
      'Attendee Name',
      'Email Address',
      'Contact Number',
      'Event Name',
      'Status',
      'Registered Date'
    ];

    const rows = displayedRegistrations.map((reg, idx) => [
      idx + 1,
      reg.name || '',
      reg.email || '',
      reg.contactNumber || 'N/A',
      reg.eventTitle || 'TRACE Event',
      reg.status || 'Confirmed',
      reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : 'N/A'
    ]);

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const eventNameSlug = regEventFilter !== 'all' ? regEventFilter.replace(/[^a-zA-Z0-9]/g, '_') : 'All_Events';
    link.href = url;
    link.setAttribute('download', `TRACE_Registrations_${eventNameSlug}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (showToast) showToast(`Successfully exported ${displayedRegistrations.length} registrations to Excel!`, 'success');
  };

  // Export Registrations to Branded Printable PDF
  const handleExportPDF = () => {
    if (!displayedRegistrations || displayedRegistrations.length === 0) {
      if (showToast) showToast('No registration data available to export.', 'warning');
      return;
    }

    const printWin = window.open('', '_blank', 'width=1100,height=750');
    if (!printWin) {
      if (showToast) showToast('Pop-up window blocked. Please allow pop-ups for this site.', 'error');
      return;
    }

    const eventName = regEventFilter === 'all' ? 'All Events' : regEventFilter;
    const statusName = regStatusFilter === 'all' ? 'All Statuses' : regStatusFilter;
    const reportDate = new Date().toLocaleString();
    const confirmedCount = displayedRegistrations.filter((r) => (r.status || 'Confirmed') === 'Confirmed').length;
    const pendingCount = displayedRegistrations.filter((r) => r.status === 'Pending').length;
    const cancelledCount = displayedRegistrations.filter((r) => r.status === 'Cancelled').length;

    const rowsHtml = displayedRegistrations
      .map(
        (r, idx) => `
        <tr>
          <td style="text-align:center;color:#64748b;font-weight:600;">${idx + 1}</td>
          <td><strong>${r.name || 'Anonymous'}</strong></td>
          <td style="color:#2563eb;">${r.email || '-'}</td>
          <td>${r.contactNumber || '-'}</td>
          <td><span style="font-weight:600;color:#0f172a;">${r.eventTitle || 'TRACE Event'}</span></td>
          <td style="text-align:center;">
            <span style="display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;${(r.status || 'Confirmed') === 'Confirmed'
            ? 'background:#dcfce7;color:#15803d;'
            : r.status === 'Pending'
              ? 'background:#fef3c7;color:#b45309;'
              : 'background:#fee2e2;color:#b91c1c;'
          }">
              ${r.status || 'Confirmed'}
            </span>
          </td>
          <td style="font-size:12px;color:#64748b;">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>TRACE Event Registrations Report - ${eventName}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body { background: #f8fafc; color: #1e293b; padding: 25px; line-height: 1.5; }
          .print-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #5d4df6; padding-bottom: 15px; margin-bottom: 20px; }
          .brand-title { font-size: 24px; font-weight: 800; color: #1e1b4b; letter-spacing: -0.5px; }
          .brand-badge { display: inline-block; background: #5d4df6; color: #fff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; margin-left: 8px; vertical-align: middle; }
          .report-meta { font-size: 12px; color: #64748b; text-align: right; }
          .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .summary-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
          .summary-card .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
          .summary-card .value { font-size: 20px; font-weight: 800; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 13px; }
          th { background: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 1px solid #cbd5e1; }
          td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
          tr:nth-child(even) { background-color: #fafbfd; }
          .action-bar { background: #1e1b4b; color: #fff; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
          .action-btn { background: #5d4df6; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; transition: background 0.2s; }
          .action-btn:hover { background: #4b36e3; }
          .close-btn { background: #334155; color: #fff; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; margin-left: 8px; }
          @media print {
            .no-print { display: none !important; }
            body { background: #fff; padding: 0; }
            @page { size: A4 landscape; margin: 10mm; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
          }
        </style>
      </head>
      <body>
        <div class="action-bar no-print">
          <div>
            <strong>TRACE Event Hub - PDF Export Preview</strong>
            <span style="opacity:0.8;font-size:12px;margin-left:8px;">Ready for Save to PDF / Printing</span>
          </div>
          <div>
            <button class="action-btn" onclick="window.print()">🖨️ Save as PDF / Print</button>
            <button class="close-btn" onclick="window.close()">✕ Close</button>
          </div>
        </div>

        <div class="print-header">
          <div>
            <div class="brand-title">TRACE EXPERT CITY <span class="brand-badge">EVENT HUB</span></div>
            <div style="font-size:14px;font-weight:600;color:#5d4df6;margin-top:4px;">Official Event Attendee Registrations Report</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">Event: <strong>${eventName}</strong> | Status Filter: <strong>${statusName}</strong></div>
          </div>
          <div class="report-meta">
            <div>Generated: <strong>${reportDate}</strong></div>
            <div>Total Attendees: <strong>${displayedRegistrations.length}</strong></div>
            <div style="color:#059669;font-weight:600;">Verified TRACE System Record</div>
          </div>
        </div>

        <div class="summary-cards">
          <div class="summary-card">
            <div class="label">Total Records</div>
            <div class="value">${displayedRegistrations.length}</div>
          </div>
          <div class="summary-card">
            <div class="label">Confirmed</div>
            <div class="value" style="color:#16a34a;">${confirmedCount}</div>
          </div>
          <div class="summary-card">
            <div class="label">Pending</div>
            <div class="value" style="color:#d97706;">${pendingCount}</div>
          </div>
          <div class="summary-card">
            <div class="label">Cancelled</div>
            <div class="value" style="color:#dc2626;">${cancelledCount}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:40px;text-align:center;">#</th>
              <th>Attendee Name</th>
              <th>Email Address</th>
              <th>Contact Number</th>
              <th>Event Title</th>
              <th style="text-align:center;">Status</th>
              <th>Registered Date</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div style="margin-top:25px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;display:flex;justify-content:space-between;">
          <span>TRACE Expert City &bull; Maradana Rd, Colombo 10 &bull; info@trace.lk</span>
          <span>Confidential Administrative Record &bull; Page 1</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();

    if (showToast) showToast('Opening printable report for Save to PDF...', 'info');
  };

  // Inquiries Action Handlers: Status Update, Delete, Export
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const res = await fetch(`/api/venue-bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setVenueBookings((prev) => {
          const updated = prev.map((b) =>
            (String(b._id || b.id) === String(bookingId) || b.bookingRef === bookingId)
              ? { ...b, status: newStatus }
              : b
          );
          try {
            sessionStorage.setItem('eventhub_admin_cached_bookings', JSON.stringify(updated));
          } catch (e) { }
          return updated;
        });
        if (showToast) showToast(`Inquiry status updated to "${newStatus}"`, 'success');
      } else {
        if (showToast) showToast(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      if (showToast) showToast('Network error updating inquiry status', 'error');
    }
  };

  const handleDeleteBooking = async (bookingId, bookingRef) => {
    if (!window.confirm(`Are you sure you want to delete inquiry "${bookingRef || ''}"?`)) return;
    try {
      const authToken = localStorage.getItem('eventhub_token') || token;
      const idToSend = bookingId || bookingRef;
      const res = await fetch(`/api/venue-bookings/${idToSend}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setVenueBookings((prev) => {
          const updated = prev.filter(
            (b) => String(b._id || b.id) !== String(bookingId) && b.bookingRef !== bookingRef
          );
          try {
            sessionStorage.setItem('eventhub_admin_cached_bookings', JSON.stringify(updated));
          } catch (e) { }
          return updated;
        });
        if (showToast) showToast('Inquiry deleted successfully', 'success');
      } else {
        if (showToast) showToast(data.message || 'Failed to delete inquiry', 'error');
      }
    } catch (err) {
      if (showToast) showToast('Network error deleting inquiry', 'error');
    }
  };

  const handleExportInquiriesCSV = () => {
    if (displayedVenueBookings.length === 0) {
      if (showToast) showToast('No inquiries match the current filter', 'error');
      return;
    }
    const headers = ['Booking Ref', 'Venue Name', 'Branch', 'Inquirer Name', 'Email', 'Phone', 'Event Title', 'Event Date', 'Duration (Hours)', 'Guests', 'Status', 'Notes', 'Created Date'];
    const rows = displayedVenueBookings.map((b) => [
      `"${b.bookingRef || ''}"`,
      `"${b.venueName || ''}"`,
      `"${b.branch || ''}"`,
      `"${b.name || ''}"`,
      `"${b.email || ''}"`,
      `"${b.phone || ''}"`,
      `"${b.eventTitle || ''}"`,
      `"${b.eventDate || ''}"`,
      `"${b.durationHours || 4}"`,
      `"${b.guests || 50}"`,
      `"${b.status || 'Pending'}"`,
      `"${(b.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(b.createdAt || Date.now()).toLocaleDateString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TRACE_Space_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Space inquiries exported to CSV successfully!', 'success');
  };

  // Filter Venue Inquiries logic for Manage Venue Inquiries Page
  const displayedVenueBookings = venueBookings.filter((bk) => {
    if (inquiryStatusFilter !== 'all' && (bk.status || 'Pending') !== inquiryStatusFilter) return false;
    if (inquiryBranchFilter !== 'all') {
      if (!bk.branch) return false;
      const targetBranch = inquiryBranchFilter.toLowerCase();
      const currentBranch = bk.branch.toLowerCase();
      if (!currentBranch.includes(targetBranch) && !targetBranch.includes(currentBranch)) {
        return false;
      }
    }

    if (inquirySearchQuery) {
      const q = inquirySearchQuery.toLowerCase();
      return (
        (bk.bookingRef && bk.bookingRef.toLowerCase().includes(q)) ||
        (bk.name && bk.name.toLowerCase().includes(q)) ||
        (bk.email && bk.email.toLowerCase().includes(q)) ||
        (bk.phone && bk.phone.toLowerCase().includes(q)) ||
        (bk.venueName && bk.venueName.toLowerCase().includes(q)) ||
        (bk.eventTitle && bk.eventTitle.toLowerCase().includes(q)) ||
        (bk.branch && bk.branch.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filter Venues / Spaces logic for Admin Spaces & Facilities page (Western Province displayed first)
  const displayedVenues = venues
    .filter((v) => {
      // 1. Search Query
      const q = venueSearchQuery.toLowerCase().trim();
      if (q) {
        const nameMatch = v.name && v.name.toLowerCase().includes(q);
        const addressMatch = v.address && v.address.toLowerCase().includes(q);
        const branchMatch = v.branch && v.branch.toLowerCase().includes(q);
        if (!nameMatch && !addressMatch && !branchMatch) return false;
      }

      // 2. Branch Filter
      if (venueBranchFilter !== 'all') {
        if (!v.branch || !v.branch.toLowerCase().includes(venueBranchFilter.toLowerCase())) {
          return false;
        }
      }

      // 3. Status Filter
      if (venueStatusFilter !== 'all') {
        if (!v.status || v.status.toLowerCase() !== venueStatusFilter.toLowerCase()) {
          return false;
        }
      }

      // 4. Space Type Filter
      if (venueTypeFilter !== 'all') {
        const types = getSpaceTypes(v).map((t) => t.toLowerCase());
        const target = venueTypeFilter.toLowerCase();
        const vName = (v.name || '').toLowerCase();
        const vDesc = (v.description || '').toLowerCase();
        const vBranch = (v.branch || '').toLowerCase();
        const str = `${vName} ${vDesc} ${vBranch}`;

        const matches = types.some((t) => {
          if (target.includes('meeting') && (t.includes('meeting') || t.includes('room') || str.includes('meeting') || str.includes('room'))) return true;
          if (target.includes('conference') && (t.includes('conference') || t.includes('hall') || str.includes('conference') || str.includes('hall'))) return true;
          if ((target.includes('co-working') || target.includes('coworking')) && (t.includes('co-working') || t.includes('coworking') || str.includes('coworking') || str.includes('co-working'))) return true;
          if (target.includes('maker') && (t.includes('maker') || t.includes('creator') || str.includes('maker') || str.includes('creator'))) return true;
          if (target.includes('workshop') && (t.includes('workshop') || str.includes('workshop'))) return true;
          if (target.includes('workation') && (t.includes('workation') || str.includes('workation'))) return true;
          if (target.includes('event') && (t.includes('event') || str.includes('event') || str.includes('deck') || str.includes('bay 07'))) return true;
          if ((target.includes('coffee') || target.includes('coffe') || target.includes('cafe')) && (t.includes('coffee') || t.includes('coffe') || t.includes('cafe') || str.includes('coffee') || str.includes('coffe') || str.includes('cafe'))) return true;
          return t === target || t.includes(target) || target.includes(t);
        });

        if (!matches) return false;
      }

      // 5. Capacity Filter
      if (venueCapacityFilter === 'small' && (v.capacity || 0) >= 100) return false;
      if (venueCapacityFilter === 'medium' && ((v.capacity || 0) < 100 || (v.capacity || 0) > 200)) return false;
      if (venueCapacityFilter === 'large' && (v.capacity || 0) <= 200) return false;

      return true;
    })
    .sort((a, b) => {
      const isAWest = isWesternSpace(a);
      const isBWest = isWesternSpace(b);
      if (isAWest && !isBWest) return -1;
      if (!isAWest && isBWest) return 1;
      return 0;
    });

  const allVenueBranches = Array.from(new Set([
    ...PRESET_BRANCHES,
    ...venues.map((v) => v.branch).filter(Boolean),
  ]));

  const pendingInquiriesCount = venueBookings.filter((b) => (b.status || 'Pending') === 'Pending').length;
  const contactedInquiriesCount = venueBookings.filter((b) => b.status === 'Contacted').length;
  const confirmedInquiriesCount = venueBookings.filter((b) => b.status === 'Confirmed').length;
  const cancelledInquiriesCount = venueBookings.filter((b) => b.status === 'Cancelled').length;
  const isEventsView = activeMenu === 'events' || activeMenu === 'upcoming' || activeMenu === 'past' || activeMenu === 'create-event';

  // Get live registration count for an event dynamically
  const getEventRegCount = (evt) => {
    if (!evt) return 0;
    const matchedRegs = registrations.filter(
      (r) =>
        (r.eventId && (r.eventId._id === evt._id || r.eventId === evt._id)) ||
        (r.eventTitle && r.eventTitle === evt.title)
    );
    return Math.max(evt.registeredCount || 0, matchedRegs.length);
  };

  return (
    <div className={`admin-dashboard-layout ${sidebarHidden ? 'sidebar-collapsed' : ''}`}>
      {/* Left Sidebar (Untitled UI Inspired Design) */}
      <aside className={`admin-sidebar ${sidebarHidden ? 'collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="admin-brand-container">
          <div
            className="brand-logo-box"
            onClick={() => setSidebarHidden(!sidebarHidden)}
            title={sidebarHidden ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
          >
            <i className="fa-solid fa-layer-group"></i>
          </div>
          {!sidebarHidden && (
            <div className="brand-text-block">
              <span className="brand-title">EventPro Admin</span>
              <span className="brand-subtitle">Enterprise Suite</span>
            </div>
          )}
          <button
            type="button"
            className="btn-sidebar-collapse-toggle"
            onClick={() => setSidebarHidden(!sidebarHidden)}
            title={sidebarHidden ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i className={`fa-solid ${sidebarHidden ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        {/* Search Bar inside Sidebar */}
        <div className="sidebar-search-wrapper">
          {sidebarHidden ? (
            <button
              type="button"
              className="sidebar-search-icon-btn"
              title="Quick Search"
              onClick={() => setSidebarHidden(false)}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          ) : (
            <div className="sidebar-search-input-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="admin-nav-menu">
          <button
            className={`admin-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
            title="Dashboard"
          >
            <i className="fa-solid fa-chart-pie"></i>
            {!sidebarHidden && <span>Dashboard</span>}
            {!sidebarHidden && (
              <i className={`fa-solid ${activeMenu === 'dashboard' ? 'fa-chevron-up' : 'fa-chevron-down'} nav-arrow`}></i>
            )}
          </button>
          {!sidebarHidden && activeMenu === 'dashboard' && (
            <div className="nav-sub-menu">
              <span className="nav-sub-item active">Overview</span>
              <span className="nav-sub-item" onClick={() => setActiveMenu('events')}>Events ({events.length})</span>
              <span className="nav-sub-item" onClick={() => setActiveMenu('registrations')}>Registrations ({registrations.length})</span>
            </div>
          )}

          <button
            className={`admin-nav-item ${isEventsView ? 'active' : ''}`}
            onClick={() => {
              setActiveMenu('events');
              setEventTab('all');
            }}
            title="Events"
          >
            <i className="fa-regular fa-calendar-days"></i>
            {!sidebarHidden && <span>Events</span>}
            {!sidebarHidden && (
              <i className={`fa-solid ${isEventsView ? 'fa-chevron-up' : 'fa-chevron-down'} nav-arrow`}></i>
            )}
          </button>
          {!sidebarHidden && isEventsView && (
            <div className="nav-sub-menu">
              <span className={`nav-sub-item ${eventTab === 'all' ? 'active' : ''}`} onClick={() => setEventTab('all')}>
                All Events ({events.length})
              </span>
              <span className={`nav-sub-item ${eventTab === 'upcoming' ? 'active' : ''}`} onClick={() => setEventTab('upcoming')}>
                Upcoming ({upcomingEvents.length})
              </span>
              <span className={`nav-sub-item ${eventTab === 'past' ? 'active' : ''}`} onClick={() => setEventTab('past')}>
                Past ({pastEvents.length})
              </span>
            </div>
          )}

          <button
            className={`admin-nav-item ${activeMenu === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveMenu('registrations')}
            title="Event Registrations"
          >
            <i className="fa-solid fa-users-gear"></i>
            {!sidebarHidden && <span>Registrations</span>}
            {!sidebarHidden && (
              <i className={`fa-solid ${activeMenu === 'registrations' ? 'fa-chevron-up' : 'fa-chevron-down'} nav-arrow`}></i>
            )}
          </button>

          <button
            className={`admin-nav-item ${activeMenu === 'users' ? 'active' : ''}`}
            onClick={() => setActiveMenu('users')}
            title="Members & Access"
          >
            <i className="fa-solid fa-user-check"></i>
            {!sidebarHidden && <span>Members & Access</span>}
            {!sidebarHidden && (
              <i className={`fa-solid ${activeMenu === 'users' ? 'fa-chevron-up' : 'fa-chevron-down'} nav-arrow`}></i>
            )}
          </button>

          <button
            className={`admin-nav-item ${activeMenu === 'venues' ? 'active' : ''}`}
            onClick={() => setActiveMenu('venues')}
            title="Spaces & Facilities"
          >
            <i className="fa-solid fa-building"></i>
            {!sidebarHidden && <span>Spaces & Facilities</span>}
            {!sidebarHidden && (
              <i className={`fa-solid ${activeMenu === 'venues' ? 'fa-chevron-up' : 'fa-chevron-down'} nav-arrow`}></i>
            )}
          </button>

          <button
            className={`admin-nav-item ${activeMenu === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveMenu('inquiries')}
            title="Space & Facility Inquiries"
          >
            <i className="fa-solid fa-envelope-open-text"></i>
            {!sidebarHidden && <span>Space Inquiries</span>}
            {!sidebarHidden && venueBookings.length > 0 && (
              <span
                style={{
                  marginLeft: 'auto',
                  marginRight: '6px',
                  background: pendingInquiriesCount > 0 ? '#ef4444' : '#6366f1',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                {pendingInquiriesCount > 0 ? `${pendingInquiriesCount} new` : venueBookings.length}
              </span>
            )}
            {!sidebarHidden && (
              <i className={`fa-solid ${activeMenu === 'inquiries' ? 'fa-chevron-up' : 'fa-chevron-down'} nav-arrow`}></i>
            )}
          </button>

          <button
            className={`admin-nav-item ${activeMenu === 'hero' ? 'active' : ''}`}
            onClick={() => setActiveMenu('hero')}
            title="Hero Banner & Media"
          >
            <i className="fa-solid fa-photo-film"></i>
            {!sidebarHidden && <span>Hero Banner</span>}
            {!sidebarHidden && (
              <i className={`fa-solid ${activeMenu === 'hero' ? 'fa-chevron-up' : 'fa-chevron-down'} nav-arrow`}></i>
            )}
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-bottom">
          <button className="admin-logout-btn" onClick={logout} title="Logout">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            {!sidebarHidden && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-container">
        {/* Body Content */}
        <main className="admin-body-content">
          {activeMenu === 'hero' ? (
            <React.Suspense fallback={<div style={{ padding: '2rem', color: '#64748b' }}>Loading hero media manager...</div>}>
              <AdminHeroTab
                heroSettings={heroSettings}
                setHeroSettings={setHeroSettings}
                savingHeroSettings={savingHeroSettings}
                handleSaveHeroSettings={handleSaveHeroSettings}
                heroPhotosList={heroPhotosList}
                heroPhotosFileInputRef={heroPhotosFileInputRef}
                handleUploadHeroPhotos={handleUploadHeroPhotos}
                uploadingHeroPhotos={uploadingHeroPhotos}
                newPhotoUrlInput={newPhotoUrlInput}
                setNewPhotoUrlInput={setNewPhotoUrlInput}
                handleAddHeroPhotoUrl={handleAddHeroPhotoUrl}
                handleMoveHeroPhoto={handleMoveHeroPhoto}
                handleRemoveHeroPhoto={handleRemoveHeroPhoto}
                heroMockupSlideIndex={heroMockupSlideIndex}
              />
            </React.Suspense>
          ) : activeMenu === 'registrations' ? (
            <React.Suspense fallback={<div style={{ padding: '2rem', color: '#64748b' }}>Loading registrations...</div>}>
              <AdminRegistrationsTab
                events={events}
                registrations={registrations}
                displayedRegistrations={displayedRegistrations}
                regEventFilter={regEventFilter}
                setRegEventFilter={setRegEventFilter}
                regStatusFilter={regStatusFilter}
                setRegStatusFilter={setRegStatusFilter}
                handleExportExcel={handleExportExcel}
                handleExportPDF={handleExportPDF}
                totalRegsCount={totalRegsCount}
                confirmedRegsCount={confirmedRegsCount}
                selectedReg={selectedReg}
                setSelectedReg={setSelectedReg}
                handleDirectStatusChange={handleDirectStatusChange}
              />
            </React.Suspense>
          ) : activeMenu === 'users' ? (
            <React.Suspense fallback={<div style={{ padding: '2rem', color: '#64748b' }}>Loading members & access...</div>}>
              <AdminUsersTab
                registeredUsers={registeredUsers}
                setRegisteredUsers={setRegisteredUsers}
                userRoleFilter={userRoleFilter}
                setUserRoleFilter={setUserRoleFilter}
                searchQuery={searchQuery}
                setShowAddBranchAdminModal={setShowAddBranchAdminModal}
                setEditingAdminUser={setEditingAdminUser}
                setEditingAdminForm={setEditingAdminForm}
                handleSendEmailCredentials={handleSendEmailCredentials}
                token={token}
                showToast={showToast}
              />
            </React.Suspense>
          ) : activeMenu === 'venues' ? (
            <React.Suspense fallback={<div style={{ padding: '2rem', color: '#64748b' }}>Loading spaces & facilities...</div>}>
              <AdminVenuesTab
                venues={venues}
                setVenues={setVenues}
                displayedVenues={displayedVenues}
                venueSearchQuery={venueSearchQuery}
                setVenueSearchQuery={setVenueSearchQuery}
                venueBranchFilter={venueBranchFilter}
                setVenueBranchFilter={setVenueBranchFilter}
                venueStatusFilter={venueStatusFilter}
                setVenueStatusFilter={setVenueStatusFilter}
                venueTypeFilter={venueTypeFilter}
                setVenueTypeFilter={setVenueTypeFilter}
                venueCapacityFilter={venueCapacityFilter}
                setVenueCapacityFilter={setVenueCapacityFilter}
                setShowAddVenueModal={setShowAddVenueModal}
                setEditingVenue={setEditingVenue}
                token={token}
                showToast={showToast}
              />
            </React.Suspense>
          ) : activeMenu === 'inquiries' ? (
            <React.Suspense fallback={<div style={{ padding: '2rem', color: '#64748b' }}>Loading space inquiries...</div>}>
              <AdminInquiriesTab
                venueBookings={venueBookings}
                displayedVenueBookings={displayedVenueBookings}
                fetchDashboardData={fetchDashboardData}
                handleExportInquiriesCSV={handleExportInquiriesCSV}
                inquiryStatusFilter={inquiryStatusFilter}
                setInquiryStatusFilter={setInquiryStatusFilter}
                inquirySearchQuery={inquirySearchQuery}
                setInquirySearchQuery={setInquirySearchQuery}
                inquiryBranchFilter={inquiryBranchFilter}
                setInquiryBranchFilter={setInquiryBranchFilter}
                allVenueBranches={allVenueBranches}
                pendingInquiriesCount={pendingInquiriesCount}
                contactedInquiriesCount={contactedInquiriesCount}
                confirmedInquiriesCount={confirmedInquiriesCount}
                cancelledInquiriesCount={cancelledInquiriesCount}
                handleUpdateBookingStatus={handleUpdateBookingStatus}
                handleDeleteBooking={handleDeleteBooking}
              />
            </React.Suspense>
          ) : isEventsView ? (
            /* VIEW 3: MANAGE EVENTS VIEW */
            <div className="manage-events-container">
              <div className="admin-dashboard-title-row">
                <div>
                  <h1 className="admin-page-title">Manage Events</h1>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Overview and administration of all organizational events.
                  </p>
                </div>
                <button
                  className="btn-create-event-blue"
                  onClick={() => setActiveMenu('create-event')}
                >
                  <i className="fa-solid fa-plus"></i> Create New Event
                </button>
              </div>

              {/* Subtabs & Filter Toolbar */}
              <div className="manage-events-toolbar">
                <div className="manage-events-tabs">
                  <button
                    className={`tab-btn ${eventTab === 'all' ? 'active' : ''}`}
                    onClick={() => setEventTab('all')}
                  >
                    All Events
                  </button>
                  <button
                    className={`tab-btn ${eventTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setEventTab('upcoming')}
                  >
                    Upcoming
                  </button>
                  <button
                    className={`tab-btn ${eventTab === 'past' ? 'active' : ''}`}
                    onClick={() => setEventTab('past')}
                  >
                    Past
                  </button>
                </div>

                <div className="manage-events-filters">
                  <div className="filter-search-input">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input
                      type="text"
                      placeholder="Search Events"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <select
                    className="filter-select-dropdown"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Status: All</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>

                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <input
                      type="date"
                      ref={dateInputRef}
                      value={eventDateFilter}
                      onChange={(e) => setEventDateFilter(e.target.value)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0,
                        opacity: 0,
                        pointerEvents: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                      }}
                    />
                    <button
                      className="filter-btn-outline"
                      type="button"
                      onClick={() => {
                        try {
                          if (dateInputRef.current && typeof dateInputRef.current.showPicker === 'function') {
                            dateInputRef.current.showPicker();
                          } else if (dateInputRef.current) {
                            dateInputRef.current.focus();
                          }
                        } catch (err) {
                          dateInputRef.current?.focus();
                        }
                      }}
                      title={eventDateFilter ? 'Click to change date' : 'Filter by date'}
                    >
                      <i className="fa-regular fa-calendar"></i>
                      <span>
                        {eventDateFilter
                          ? new Date(eventDateFilter + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                          : 'Any Date'}
                      </span>
                      {eventDateFilter && (
                        <span
                          role="button"
                          tabIndex={0}
                          title="Clear date filter"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEventDateFilter('');
                          }}
                          style={{
                            marginLeft: '4px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Events Data Table Card */}
              <div className="admin-card-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>EVENT</th>
                        <th>DATE & TIME</th>
                        <th>LOCATION</th>
                        <th>REGISTRATIONS</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedEvents.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            No events found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        displayedEvents.map((evt) => (
                          <tr key={evt._id}>
                            <td>
                              <div className="event-table-cell">
                                <img
                                  src={
                                    optimizeImageUrl(evt.coverImage, 300) ||
                                    DEFAULT_EVENT_BANNER
                                  }
                                  alt={evt.title}
                                  className="event-thumb"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_EVENT_BANNER;
                                  }}
                                  decoding="async"
                                />
                                <div>
                                  <div className="event-cell-title">{evt.title}</div>
                                  <span className="event-cell-id">ID: EVT-{(evt._id || '9824').toString().slice(-4).toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="cell-date-time">
                                <div>
                                  {new Date(evt.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </div>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  {evt.time || '09:00 AM - 05:00 PM'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="cell-location">
                                <div style={{ fontWeight: '600', color: '#334155' }}>{evt.location}</div>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Colombo, LK</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="progress-bar-track" style={{ width: '80px', height: '6px' }}>
                                  <div
                                    className={`progress-fill ${evt.status === 'upcoming' ? 'fill-blue' : 'fill-slate'
                                      }`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (getEventRegCount(evt) / (evt.capacity || 100)) * 100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="cell-reg-ratio" style={{ fontSize: '0.82rem' }}>
                                  {getEventRegCount(evt)} / {evt.capacity || 100}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`status-pill ${evt.status === 'upcoming' ? 'active' : 'draft'
                                  }`}
                              >
                                {evt.status === 'upcoming' ? 'Upcoming' : 'Past'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-group">
                                <button
                                  className="icon-btn-action"
                                  title="View Details"
                                  onClick={() =>
                                    showToast && showToast(`Viewing "${evt.title}"`, 'info')
                                  }
                                >
                                  <i className="fa-regular fa-eye"></i>
                                </button>
                                <button
                                  className="icon-btn-action"
                                  title="Edit Event & Upload Photos"
                                  onClick={() => setEditingEvent(evt)}
                                >
                                  <i className="fa-regular fa-pen-to-square"></i>
                                </button>
                                <button
                                  className="icon-btn-action"
                                  title="Duplicate Event"
                                  onClick={() => handleDuplicateEvent(evt)}
                                >
                                  <i className="fa-regular fa-copy"></i>
                                </button>
                                <button
                                  className="icon-btn-action danger"
                                  title="Delete Event"
                                  onClick={() => handleDeleteEvent(evt._id, evt.title)}
                                >
                                  <i className="fa-regular fa-trash-can"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Bar */}
                <div className="table-pagination-bar">
                  <span className="pagination-info">
                    Showing 1 to {displayedEvents.length} of {events.length} results
                  </span>
                  <div className="pagination-controls">
                    <button className="page-nav-btn disabled">Previous</button>
                    <button className="page-num-btn active">1</button>
                    <button className="page-num-btn">2</button>
                    <button className="page-num-btn">3</button>
                    <button className="page-nav-btn">Next</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW 4: MAIN DASHBOARD VIEW */
            <div>
              <div className="admin-dashboard-title-row">
                <div>
                  <h1 className="admin-page-title">Event Management Dashboard</h1>
                </div>
                <div className="last-updated-text">
                  Last updated: Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* 4 Stat Cards Row */}
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Total Events</span>
                    <div className="stat-value">{totalEventsCount}</div>
                    <div className="stat-trend positive">
                      <i className="fa-solid fa-arrow-trend-up"></i> +5% this month
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>
                    <i className="fa-regular fa-calendar"></i>
                  </div>
                </div>

                <div className="stat-card stat-purple">
                  <div className="stat-info">
                    <span className="stat-label">Upcoming Events</span>
                    <div className="stat-value" style={{ color: '#7c3aed' }}>{upcomingCount}</div>
                    <div className="stat-trend neutral">Next event in 3 days</div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#f3e8ff', color: '#7c3aed', borderColor: '#ddd6fe' }}>
                    <i className="fa-regular fa-calendar-check"></i>
                  </div>
                </div>

                <div className="stat-card stat-emerald">
                  <div className="stat-info">
                    <span className="stat-label">Past Events</span>
                    <div className="stat-value" style={{ color: '#059669' }}>{pastCount}</div>
                    <div className="stat-trend positive">
                      <i className="fa-solid fa-check-double"></i> Completed
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </div>
                </div>

                <div className="stat-card stat-amber">
                  <div className="stat-info">
                    <span className="stat-label">Total Registrations</span>
                    <div className="stat-value" style={{ color: '#d97706' }}>{totalRegsCount.toLocaleString()}</div>
                    <div className="stat-trend positive">
                      <i className="fa-solid fa-arrow-trend-up"></i> +12% this month
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706', borderColor: '#fde68a' }}>
                    <i className="fa-solid fa-user-group"></i>
                  </div>
                </div>

                <div
                  className="stat-card stat-indigo"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setActiveMenu('inquiries')}
                  title="View Space Inquiries"
                >
                  <div className="stat-info">
                    <span className="stat-label">Space Inquiries</span>
                    <div className="stat-value" style={{ color: '#4f46e5' }}>{venueBookings.length}</div>
                    <div className="stat-trend neutral" style={{ color: pendingInquiriesCount > 0 ? '#d97706' : '#059669', fontWeight: 700 }}>
                      <i className={`fa-solid ${pendingInquiriesCount > 0 ? 'fa-bell' : 'fa-check'}`}></i>{' '}
                      {pendingInquiriesCount > 0 ? `${pendingInquiriesCount} Pending Review` : 'All Reviewed'}
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#eef2ff', color: '#4f46e5', borderColor: '#c7d2fe' }}>
                    <i className="fa-solid fa-envelope-open-text"></i>
                  </div>
                </div>
              </div>

              {/* Middle Row (2 Columns) */}
              <div className="admin-middle-grid">
                {/* Left Box: Upcoming Events Table */}
                <div className="admin-card-panel">
                  <div className="panel-header-row">
                    <h3>Upcoming Events</h3>
                    <button
                      className="btn-link-view-all"
                      onClick={() => {
                        setActiveMenu('events');
                        setEventTab('upcoming');
                      }}
                    >
                      View All <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>

                  <div className="table-responsive-wrapper">
                    <table className="admin-data-table">
                      <thead>
                        <tr>
                          <th>EVENT</th>
                          <th>DATE</th>
                          <th>LOCATION</th>
                          <th>REGISTRATIONS</th>
                          <th>STATUS</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingEvents.slice(0, 4).map((evt, idx) => (
                          <tr key={evt._id || idx}>
                            <td>
                              <div className="event-table-cell">
                                <img
                                  src={
                                    optimizeImageUrl(evt.coverImage, 300) ||
                                    DEFAULT_EVENT_BANNER
                                  }
                                  alt={evt.title}
                                  className="event-thumb"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_EVENT_BANNER;
                                  }}
                                  decoding="async"
                                />
                                <div>
                                  <div className="event-cell-title">{evt.title}</div>
                                  <span className="event-cell-id">ID: EVT-{(evt._id || '9824').toString().slice(-4).toUpperCase()}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="cell-date-text">
                                {new Date(evt.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </td>
                            <td>
                              <span className="cell-location-text">{evt.location}</span>
                            </td>
                            <td>
                              <span className="cell-reg-ratio">
                                {getEventRegCount(evt)} / {evt.capacity || 100}
                              </span>
                            </td>
                            <td>
                              <span className="status-pill active">Active</span>
                            </td>
                            <td>
                              <div className="action-buttons-group">
                                <button
                                  className="icon-btn-action"
                                  title="Edit Event"
                                  onClick={() => setEditingEvent(evt)}
                                >
                                  <i className="fa-regular fa-pen-to-square"></i>
                                </button>
                                <button
                                  className="icon-btn-action danger"
                                  title="Delete Event"
                                  onClick={() => handleDeleteEvent(evt._id, evt.title)}
                                >
                                  <i className="fa-regular fa-trash-can"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Box: Registrations Overview */}
                <div className="admin-card-panel">
                  <div className="panel-header-row">
                    <div>
                      <h3>Registrations Overview</h3>
                      <span className="panel-subtext">Top Events by Registration</span>
                    </div>
                  </div>

                  <div className="overview-progress-list">
                    <div className="progress-item-box">
                      <div className="progress-label-row">
                        <span>Tech Symposium 2024</span>
                        <strong>345</strong>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-fill fill-blue" style={{ width: '70%' }}></div>
                      </div>
                    </div>

                    <div className="progress-item-box">
                      <div className="progress-label-row">
                        <span>Design Patterns Meetup</span>
                        <strong>120</strong>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-fill fill-teal" style={{ width: '40%' }}></div>
                      </div>
                    </div>

                    <div className="progress-item-box">
                      <div className="progress-label-row">
                        <span>Leadership Workshop</span>
                        <strong>45</strong>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-fill fill-slate" style={{ width: '22%' }}></div>
                      </div>
                    </div>

                    <div className="progress-item-box">
                      <div className="progress-label-row">
                        <span>Marketing Summit</span>
                        <strong>28</strong>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-fill fill-slate" style={{ width: '15%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Recent Registrations Table */}
              <div className="admin-card-panel" style={{ marginTop: '1.75rem' }}>
                <div className="panel-header-row">
                  <h3>Recent Registrations</h3>
                  <button
                    className="btn-link-view-all"
                    onClick={() => setActiveMenu('registrations')}
                  >
                    View All <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>

                <div className="table-responsive-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>EVENT</th>
                        <th>REGISTRATION DATE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedRegistrations.slice(0, 6).map((reg, idx) => (
                        <tr key={reg._id || idx} style={{ cursor: 'pointer' }} onClick={() => { setActiveMenu('registrations'); setSelectedReg(reg); }}>
                          <td>
                            <strong className="registrant-name">{reg.name}</strong>
                          </td>
                          <td>
                            <span className="registrant-email">{reg.email}</span>
                          </td>
                          <td>
                            <span className="cell-event-title">{reg.eventTitle || 'Tech Summit 2024'}</span>
                          </td>
                          <td>
                            <span className="cell-date-text">
                              {reg.createdAt
                                ? new Date(reg.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                                : 'Today, 08:30 AM'}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select
                              className="status-pill-select"
                              value={reg.status || 'Confirmed'}
                              onChange={(e) => handleDirectStatusChange(reg._id, e.target.value)}
                              style={{
                                padding: '4px 12px',
                                borderRadius: '9999px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                border: '1px solid transparent',
                                cursor: 'pointer',
                                outline: 'none',
                                backgroundColor: (reg.status || 'Confirmed') === 'Confirmed' ? '#dcfce7' : (reg.status || 'Confirmed') === 'Pending' ? '#fef3c7' : '#fee2e2',
                                color: (reg.status || 'Confirmed') === 'Confirmed' ? '#15803d' : (reg.status || 'Confirmed') === 'Pending' ? '#b45309' : '#b91c1c'
                              }}
                            >
                              <option value="Confirmed" style={{ background: '#fff', color: '#0f172a' }}>Confirmed</option>
                              <option value="Pending" style={{ background: '#fff', color: '#0f172a' }}>Pending</option>
                              <option value="Cancelled" style={{ background: '#fff', color: '#0f172a' }}>Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Lazy-Loaded Registration Drawer & User/Admin Modals */}
      {(selectedReg || showAddBranchAdminModal || editingAdminUser || emailNotificationModalData) && (
        <React.Suspense fallback={null}>
          <AdminUserModals
            selectedReg={selectedReg}
            setSelectedReg={setSelectedReg}
            getInitials={getInitials}
            isChangingStatus={isChangingStatus}
            setIsChangingStatus={setIsChangingStatus}
            editingRegStatus={editingRegStatus}
            setEditingRegStatus={setEditingRegStatus}
            copyToClipboard={copyToClipboard}
            isEditingNotes={isEditingNotes}
            setIsEditingNotes={setIsEditingNotes}
            editingRegNotes={editingRegNotes}
            setEditingRegNotes={setEditingRegNotes}
            showToast={showToast}
            handleSaveRegistrationChanges={handleSaveRegistrationChanges}
            savingReg={savingReg}
            showAddBranchAdminModal={showAddBranchAdminModal}
            setShowAddBranchAdminModal={setShowAddBranchAdminModal}
            handleCreateBranchAdmin={handleCreateBranchAdmin}
            branchAdminForm={branchAdminForm}
            setBranchAdminForm={setBranchAdminForm}
            submittingBranchAdmin={submittingBranchAdmin}
            editingAdminUser={editingAdminUser}
            setEditingAdminUser={setEditingAdminUser}
            handleSaveAdminEdit={handleSaveAdminEdit}
            editingAdminForm={editingAdminForm}
            setEditingAdminForm={setEditingAdminForm}
            savingAdminEdit={savingAdminEdit}
            emailNotificationModalData={emailNotificationModalData}
            setEmailNotificationModalData={setEmailNotificationModalData}
          />
        </React.Suspense>
      )}

      {/* Create Event Professional Modal Overlay */}
      {activeMenu === 'create-event' && (
        <React.Suspense fallback={<div className="modal-overlay"><div style={{ color: '#fff', fontWeight: 600 }}>Loading editor...</div></div>}>
          <CreateEventPage
            onCancel={() => setActiveMenu('events')}
            onEventCreated={(newEvent) => {
              if (newEvent && newEvent._id) {
                setEvents((prev) => [newEvent, ...prev]);
              }
              if (onEventCreated) onEventCreated(newEvent);
              fetchDashboardData();
              setActiveMenu('events');
            }}
            showToast={showToast}
            currentUser={currentUser}
          />
        </React.Suspense>
      )}

      {/* Edit Event Modal */}
      {Boolean(editingEvent) && (
        <React.Suspense fallback={null}>
          <EditEventModal
            isOpen={Boolean(editingEvent)}
            onClose={() => setEditingEvent(null)}
            event={editingEvent}
            token={token || localStorage.getItem('eventhub_token')}
            currentUser={currentUser}
            onEventUpdated={(updatedEvent) => {
              const targetId = String(updatedEvent?._id || updatedEvent?.id || '');
              if (targetId) {
                setEvents((prev) => {
                  const next = prev.map((e) =>
                    String(e._id || e.id) === targetId ? { ...e, ...updatedEvent } : e
                  );
                  try {
                    sessionStorage.setItem('eventhub_admin_cached_events', JSON.stringify(next));
                    sessionStorage.setItem('eventhub_cached_events', JSON.stringify(next));
                    localStorage.setItem('eventhub_cached_events', JSON.stringify(next));
                  } catch (e) { }
                  return next;
                });
              }
              if (onEventUpdated) onEventUpdated(updatedEvent);
              fetchDashboardData(true);
            }}
            showToast={showToast}
          />
        </React.Suspense>
      )}

      {/* Add / Edit Venue Modal */}
      {(showAddVenueModal || Boolean(editingVenue)) && (
        <React.Suspense fallback={null}>
          <AddVenueModal
            isOpen={showAddVenueModal || Boolean(editingVenue)}
            onClose={() => {
              setShowAddVenueModal(false);
              setEditingVenue(null);
            }}
            token={token || localStorage.getItem('eventhub_token')}
            editingVenue={editingVenue}
            onVenueCreated={(newVenue) => {
              setVenues((prev) => [newVenue, ...prev]);
              fetchDashboardData();
            }}
            onVenueUpdated={(updatedVenue) => {
              setVenues((prev) =>
                prev.map((v) =>
                  (v._id || v.id) === (updatedVenue._id || updatedVenue.id) ? updatedVenue : v
                )
              );
              fetchDashboardData();
            }}
            showToast={showToast}
          />
        </React.Suspense>
      )}
    </div>
  );
}
