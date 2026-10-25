import React, { useState, useEffect, useRef } from 'react';
import EditEventModal from './modals/EditEventModal';
import AddVenueModal, { PRESET_BRANCHES } from './modals/AddVenueModal';
import CreateEventPage from './CreateEventPage';
import CloudinaryUploader from './CloudinaryUploader';
import { notifyEventUpdated, notifyVenueUpdated } from '../utils/eventUtils';

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
      'From Shed sessions to Midweek Boost evenings, discover and register for the events shaping TRACE Expert City — then keep every one of them in view.',
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

  const fetchDashboardData = async (silent = false) => {
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
          fetch('/api/events', { headers }).then((r) => r.json()),
          fetch('/api/registrations', { headers }).then((r) => r.json()),
          fetch('/api/venues', { headers }).then((r) => r.json()),
          fetch('/api/venue-bookings', { headers }).then((r) => r.json()),
          fetch('/api/auth/users', { headers }).then((r) => r.json()),
          fetch('/api/settings/hero').then((r) => r.json()),
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
        setVenueBookings((prev) =>
          prev.map((b) => (String(b._id || b.id) === String(bookingId) ? { ...b, status: newStatus } : b))
        );
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
      const res = await fetch(`/api/venue-bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setVenueBookings((prev) => prev.filter((b) => String(b._id || b.id) !== String(bookingId)));
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

  // Filter Venues / Spaces logic for Admin Spaces & Facilities page
  const displayedVenues = venues.filter((v) => {
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
      const vType = (v.type || '').toLowerCase();
      const target = venueTypeFilter.toLowerCase();
      const vName = (v.name || '').toLowerCase();
      if (!vType.includes(target) && !target.includes(vType) && !vName.includes(target)) return false;
    }

    // 5. Capacity Filter
    if (venueCapacityFilter === 'small' && (v.capacity || 0) >= 100) return false;
    if (venueCapacityFilter === 'medium' && ((v.capacity || 0) < 100 || (v.capacity || 0) > 200)) return false;
    if (venueCapacityFilter === 'large' && (v.capacity || 0) <= 200) return false;

    return true;
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
            /* VIEW: HERO BANNER & MEDIA MANAGER */
            <div className="manage-hero-container">
              <div className="admin-dashboard-title-row">
                <div>
                  <h1 className="admin-page-title">Hero Media & Banner</h1>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Default TRACE video and words are active. You can add a new photo or video here if needed.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <a
                    href="#home"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-export-excel"
                    style={{
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: '#f8fafc',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '0.65rem 1.1rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                    }}
                    title="Open live homepage to see current hero section"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i> View Live Site
                  </a>
                  <button
                    type="button"
                    className="btn-export-excel"
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    }}
                    onClick={() => handleSaveHeroSettings()}
                    disabled={savingHeroSettings}
                  >
                    {savingHeroSettings ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-cloud-arrow-up"></i> Save & Apply Changes
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mode Selector Cards: 3 Options (Default Video, New Photo, New Video) */}
              <div className="hero-mode-selector-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {/* Option 1: Default Original Video */}
                <div
                  className={`hero-mode-card ${heroSettings.heroMediaType === 'default' ? 'active' : ''}`}
                  onClick={() =>
                    setHeroSettings((prev) => ({
                      ...prev,
                      heroMediaType: 'default',
                    }))
                  }
                >
                  <div className="hero-mode-card-icon">
                    <i className="fa-solid fa-film"></i>
                  </div>
                  <div className="hero-mode-card-content">
                    <h4>Original TRACE Video</h4>
                    <p>Default video background & original texts.</p>
                  </div>
                  <div className="hero-mode-check">
                    <i
                      className={`fa-solid ${heroSettings.heroMediaType === 'default'
                        ? 'fa-circle-check text-blue-600'
                        : 'fa-circle text-slate-300'
                        }`}
                    ></i>
                  </div>
                </div>

                {/* Option 2: Add New Photo / Slideshow */}
                <div
                  className={`hero-mode-card ${heroSettings.heroMediaType === 'image' ? 'active' : ''}`}
                  onClick={() =>
                    setHeroSettings((prev) => ({
                      ...prev,
                      heroMediaType: 'image',
                    }))
                  }
                >
                  <div className="hero-mode-card-icon">
                    <i className="fa-solid fa-images"></i>
                  </div>
                  <div className="hero-mode-card-content">
                    <h4>Add New Photos / Slideshow (Up to 10)</h4>
                    <p>Upload up to 10 photos that automatically transition one by one.</p>
                  </div>
                  <div className="hero-mode-check">
                    <i
                      className={`fa-solid ${heroSettings.heroMediaType === 'image'
                        ? 'fa-circle-check text-blue-600'
                        : 'fa-circle text-slate-300'
                        }`}
                    ></i>
                  </div>
                </div>

                {/* Option 3: Add New Video */}
                <div
                  className={`hero-mode-card ${heroSettings.heroMediaType === 'video' ? 'active' : ''}`}
                  onClick={() =>
                    setHeroSettings((prev) => ({
                      ...prev,
                      heroMediaType: 'video',
                    }))
                  }
                >
                  <div className="hero-mode-card-icon">
                    <i className="fa-solid fa-video"></i>
                  </div>
                  <div className="hero-mode-card-content">
                    <h4>Add New Video</h4>
                    <p>Upload or set a new custom video loop.</p>
                  </div>
                  <div className="hero-mode-check">
                    <i
                      className={`fa-solid ${heroSettings.heroMediaType === 'video'
                        ? 'fa-circle-check text-blue-600'
                        : 'fa-circle text-slate-300'
                        }`}
                    ></i>
                  </div>
                </div>
              </div>

              {/* Main Content Layout Grid: Left Media Upload / Right Preview */}
              <div className="hero-manager-main-grid">
                {/* Left Column: Media Upload / Setup */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                  {/* Default State Active Banner */}
                  {heroSettings.heroMediaType === 'default' && (
                    <div className="hero-card-panel" style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', fontSize: '1.2rem' }}></i>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                          Original Video & Texts Active
                        </h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                        The homepage hero is currently playing the original TRACE video with original texts.
                        To set a new custom photo slideshow or video, click <strong>"Add New Photos / Slideshow"</strong> or <strong>"Add New Video"</strong> above.
                      </p>
                    </div>
                  )}

                  {/* Panel for Photo (Image) Upload - Up to 10 Photos Slideshow */}
                  {heroSettings.heroMediaType === 'image' && (
                    <div className="hero-card-panel">
                      <div className="hero-card-header">
                        <div>
                          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <i className="fa-solid fa-images" style={{ color: '#2563eb' }}></i> Hero Photos Slideshow
                          </h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                            Upload up to 10 photos. On the website hero banner, they will smoothly auto-transition one by one.
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '9999px',
                            background: heroPhotosList.length > 0 ? '#dbeafe' : '#f1f5f9',
                            color: heroPhotosList.length > 0 ? '#1e40af' : '#64748b',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="fa-solid fa-photo-film"></i> {heroPhotosList.length} / 10 Photos
                        </span>
                      </div>

                      {/* Upload Photos from Computer (Multiple, up to 10) */}
                      <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#2563eb', marginRight: '6px' }}></i>
                            1. Upload Photos from Computer
                          </label>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {10 - heroPhotosList.length > 0
                              ? `${10 - heroPhotosList.length} photo slot(s) remaining`
                              : 'Maximum 10 photos reached'}
                          </span>
                        </div>

                        <input
                          type="file"
                          ref={heroPhotosFileInputRef}
                          multiple
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleUploadHeroPhotos}
                          disabled={uploadingHeroPhotos || heroPhotosList.length >= 10}
                        />

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{
                              background: heroPhotosList.length >= 10 ? '#94a3b8' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                              padding: '0.65rem 1.25rem',
                              fontWeight: 700,
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: heroPhotosList.length >= 10 || uploadingHeroPhotos ? 'not-allowed' : 'pointer',
                            }}
                            onClick={() => heroPhotosFileInputRef.current && heroPhotosFileInputRef.current.click()}
                            disabled={uploadingHeroPhotos || heroPhotosList.length >= 10}
                          >
                            {uploadingHeroPhotos ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin"></i> Uploading Photos...
                              </>
                            ) : (
                              <>
                                <i className="fa-solid fa-plus"></i> Select & Upload Photos (Up to 10)
                              </>
                            )}
                          </button>

                          {heroPhotosList.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to clear all photos from the hero slideshow?')) {
                                  const updated = {
                                    ...heroSettings,
                                    heroImages: [],
                                    heroImageUrl: '',
                                    heroMediaType: 'default',
                                  };
                                  setHeroSettings(updated);
                                  handleSaveHeroSettings(updated);
                                }
                              }}
                              style={{
                                background: '#fef2f2',
                                color: '#ef4444',
                                border: '1px solid #fee2e2',
                                padding: '0.65rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.84rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <i className="fa-solid fa-trash-can"></i> Clear All Photos
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Direct Image URL input */}
                      <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                          <i className="fa-solid fa-link" style={{ color: '#2563eb', marginRight: '6px' }}></i>
                          2. Or Paste Photo URL
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="https://example.com/photo.jpg or Cloudinary URL..."
                            value={newPhotoUrlInput}
                            onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddHeroPhotoUrl();
                              }
                            }}
                            disabled={heroPhotosList.length >= 10}
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              fontSize: '0.88rem',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleAddHeroPhotoUrl}
                            disabled={!newPhotoUrlInput.trim() || heroPhotosList.length >= 10}
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0 1.2rem',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              cursor: !newPhotoUrlInput.trim() || heroPhotosList.length >= 10 ? 'not-allowed' : 'pointer',
                              opacity: !newPhotoUrlInput.trim() || heroPhotosList.length >= 10 ? 0.6 : 1,
                            }}
                          >
                            <i className="fa-solid fa-plus"></i> Add Photo
                          </button>
                        </div>
                      </div>

                      {/* Photo Slideshow Gallery Grid (Up to 10) */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            <i className="fa-regular fa-clone" style={{ color: '#2563eb', marginRight: '6px' }}></i>
                            Slideshow Photos List ({heroPhotosList.length} of 10)
                          </label>
                          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Photos auto-transition one by one on the live site
                          </span>
                        </div>

                        {heroPhotosList.length === 0 ? (
                          <div
                            style={{
                              padding: '2.5rem 1.5rem',
                              textAlign: 'center',
                              background: '#f8fafc',
                              border: '2px dashed #cbd5e1',
                              borderRadius: '12px',
                              color: '#64748b',
                            }}
                          >
                            <i className="fa-regular fa-image fa-3x" style={{ color: '#94a3b8', marginBottom: '0.75rem' }}></i>
                            <h4 style={{ margin: '0 0 0.35rem 0', color: '#334155', fontSize: '1rem', fontWeight: 700 }}>
                              No Photos in Slideshow Yet
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>
                              Upload or add up to 10 photos above to activate the automated slideshow on the hero banner.
                            </p>
                          </div>
                        ) : (
                          <div className="hero-photos-manager-grid">
                            {heroPhotosList.map((photoUrl, photoIdx) => (
                              <div key={`${photoUrl}-${photoIdx}`} className="hero-photo-manage-card">
                                <div className="hero-photo-manage-badge">
                                  {photoIdx === 0 ? 'Photo 1 (Cover)' : `Photo ${photoIdx + 1}`}
                                </div>
                                <div className="hero-photo-manage-img-box">
                                  <img src={photoUrl} alt={`Photo ${photoIdx + 1}`} loading="lazy" />
                                </div>
                                <div className="hero-photo-manage-actions">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveHeroPhoto(photoIdx, photoIdx - 1)}
                                    disabled={photoIdx === 0}
                                    title="Move earlier"
                                    className="hero-photo-btn-icon"
                                  >
                                    <i className="fa-solid fa-chevron-left"></i>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveHeroPhoto(photoIdx, photoIdx + 1)}
                                    disabled={photoIdx === heroPhotosList.length - 1}
                                    title="Move later"
                                    className="hero-photo-btn-icon"
                                  >
                                    <i className="fa-solid fa-chevron-right"></i>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveHeroPhoto(photoIdx)}
                                    title="Remove this photo"
                                    className="hero-photo-btn-delete"
                                  >
                                    <i className="fa-solid fa-trash-can"></i>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Panel for Custom Video Upload */}
                  {heroSettings.heroMediaType === 'video' && (
                    <div className="hero-card-panel">
                      <div className="hero-card-header">
                        <h3>
                          <i className="fa-solid fa-video"></i> Custom Video
                        </h3>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            background: '#dbeafe',
                            color: '#1e40af',
                            fontWeight: 700,
                          }}
                        >
                          Custom Video Mode Active
                        </span>
                      </div>

                      {/* Cloudinary Uploader Component for Video */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '0.4rem',
                          }}
                        >
                          1. Upload Video from Computer
                        </label>
                        <CloudinaryUploader
                          accept="video/*"
                          label="Upload Custom Video"
                          onUploadSuccess={(url) => {
                            const updated = {
                              ...heroSettings,
                              heroVideoUrl: url,
                              heroMediaType: 'video',
                            };
                            setHeroSettings(updated);
                            handleSaveHeroSettings(updated);
                          }}
                        />
                      </div>

                      {/* Direct Video URL input */}
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '0.4rem',
                          }}
                        >
                          2. Or Enter Video URL (.mp4)
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="https://example.com/my-video.mp4"
                            value={heroSettings.heroVideoUrl || ''}
                            onChange={(e) =>
                              setHeroSettings((prev) => ({
                                ...prev,
                                heroVideoUrl: e.target.value,
                                heroMediaType: 'video',
                              }))
                            }
                            style={{
                              flex: 1,
                              padding: '0.65rem 0.85rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              fontSize: '0.88rem',
                              outline: 'none',
                            }}
                          />
                          {heroSettings.heroVideoUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setHeroSettings((prev) => ({
                                  ...prev,
                                  heroVideoUrl: '',
                                }))
                              }
                              style={{
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '0 0.85rem',
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                              title="Clear video URL"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Panel: Hero Section Texts & Headings */}
                  <div className="hero-card-panel">
                    <div className="hero-card-header">
                      <h3>
                        <i className="fa-solid fa-heading"></i> Hero Words & Text
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setHeroSettings((prev) => ({
                            ...prev,
                            heroBadge: 'TRACE COMMUNITY HUB, SRI LANKA',
                            heroTitle: 'Where innovation meets community and culture.',
                            heroSubtitle:
                              'From Shed sessions to Midweek Boost evenings, discover and register for the events shaping TRACE Expert City — then keep every one of them in view.',
                          }))
                        }
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563eb',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Reset to Original Words
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '0.35rem',
                          }}
                        >
                          BADGE TEXT
                        </label>
                        <input
                          type="text"
                          value={heroSettings.heroBadge || ''}
                          onChange={(e) =>
                            setHeroSettings((prev) => ({ ...prev, heroBadge: e.target.value }))
                          }
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '0.35rem',
                          }}
                        >
                          MAIN TITLE
                        </label>
                        <input
                          type="text"
                          value={heroSettings.heroTitle || ''}
                          onChange={(e) =>
                            setHeroSettings((prev) => ({ ...prev, heroTitle: e.target.value }))
                          }
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#475569',
                            marginBottom: '0.35rem',
                          }}
                        >
                          SUBTITLE DESCRIPTION
                        </label>
                        <textarea
                          rows={3}
                          value={heroSettings.heroSubtitle || ''}
                          onChange={(e) =>
                            setHeroSettings((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                          }
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontFamily: 'inherit',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Mockup Preview & Action Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="hero-card-panel">
                    <div className="hero-card-header">
                      <h3>
                        <i className="fa-solid fa-display"></i> Live Mockup Preview
                      </h3>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '9999px',
                          background:
                            heroSettings.heroMediaType === 'image'
                              ? '#eff6ff'
                              : heroSettings.heroMediaType === 'video'
                                ? '#f0fdf4'
                                : '#f8fafc',
                          color:
                            heroSettings.heroMediaType === 'image'
                              ? '#1d4ed8'
                              : heroSettings.heroMediaType === 'video'
                                ? '#15803d'
                                : '#475569',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background:
                              heroSettings.heroMediaType === 'image'
                                ? '#2563eb'
                                : heroSettings.heroMediaType === 'video'
                                  ? '#22c55e'
                                  : '#64748b',
                          }}
                        ></span>
                        {heroSettings.heroMediaType === 'image'
                          ? 'Custom Photo'
                          : heroSettings.heroMediaType === 'video'
                            ? 'Custom Video'
                            : 'Original Video'}
                      </span>
                    </div>

                    {/* The Live Interactive Mockup Box */}
                    <div className="hero-live-preview-container">
                      {heroSettings.heroMediaType === 'image' && heroPhotosList.length > 0 ? (
                        <>
                          {heroPhotosList.map((photoUrl, pIdx) => (
                            <img
                              key={`${photoUrl}-${pIdx}`}
                              src={photoUrl}
                              alt={`Hero Preview ${pIdx + 1}`}
                              className="hero-live-preview-bg"
                              style={{
                                opacity: pIdx === heroMockupSlideIndex ? 1 : 0,
                                transition: 'opacity 0.8s ease-in-out',
                                zIndex: pIdx === heroMockupSlideIndex ? 1 : 0,
                              }}
                            />
                          ))}
                          {heroPhotosList.length > 1 && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                zIndex: 10,
                                background: 'rgba(15, 23, 42, 0.8)',
                                color: '#ffffff',
                                padding: '3px 9px',
                                borderRadius: '14px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <i className="fa-solid fa-play" style={{ fontSize: '0.62rem', color: '#60a5fa' }}></i>
                              Photo {heroMockupSlideIndex + 1} of {heroPhotosList.length}
                            </div>
                          )}
                        </>
                      ) : heroSettings.heroMediaType === 'video' && heroSettings.heroVideoUrl ? (
                        <video
                          src={heroSettings.heroVideoUrl}
                          className="hero-live-preview-bg"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <div
                          className="hero-live-preview-bg"
                          style={{
                            background: 'radial-gradient(ellipse at center, #1e293b 0%, #020617 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ color: '#64748b', textAlign: 'center' }}>
                            <i className="fa-solid fa-film fa-2x" style={{ opacity: 0.6, marginBottom: '0.4rem' }}></i>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Original TRACE Video Playing</div>
                          </div>
                        </div>
                      )}

                      <div className="hero-live-preview-overlay"></div>

                      <div className="hero-live-preview-content">
                        <span className="hero-live-preview-badge">
                          {heroSettings.heroBadge || 'TRACE COMMUNITY HUB, SRI LANKA'}
                        </span>
                        <h2 className="hero-live-preview-title">
                          {heroSettings.heroTitle || 'Where innovation meets community and culture.'}
                        </h2>
                        <p className="hero-live-preview-sub">
                          {heroSettings.heroSubtitle ||
                            'From Shed sessions to Midweek Boost evenings, discover and register for the events shaping TRACE Expert City — then keep every one of them in view.'}
                        </p>
                        <div className="hero-live-preview-actions">
                          <button
                            type="button"
                            className="hero-live-preview-btn"
                            style={{ background: '#2563eb', color: '#fff' }}
                          >
                            Explore Upcoming Events
                          </button>
                          <button
                            type="button"
                            className="hero-live-preview-btn"
                            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                          >
                            Explore Spaces
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Preview Info & Helper */}
                    <div
                      style={{
                        marginTop: '1.25rem',
                        padding: '1rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        color: '#475569',
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                        <i className="fa-solid fa-circle-info" style={{ color: '#2563eb' }}></i> Instant Update
                      </div>
                      When you click <strong>Save & Apply Changes</strong>, settings synchronize to the database and update the live homepage without page reload.
                    </div>

                    {/* Save & Reset Buttons Panel */}
                    <div
                      style={{
                        marginTop: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleSaveHeroSettings()}
                        disabled={savingHeroSettings}
                        style={{
                          width: '100%',
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.85rem 1.25rem',
                          borderRadius: '10px',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.6rem',
                          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                          transition: 'all 0.2s',
                        }}
                      >
                        {savingHeroSettings ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-check"></i> Save & Apply Changes
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const defaults = {
                            heroMediaType: 'default',
                            heroImageUrl: '',
                            heroVideoUrl: '',
                            heroBadge: 'TRACE COMMUNITY HUB, SRI LANKA',
                            heroTitle: 'Where innovation meets community and culture.',
                            heroSubtitle:
                              'From Shed sessions to Midweek Boost evenings, discover and register for the events shaping TRACE Expert City — then keep every one of them in view.',
                          };
                          setHeroSettings(defaults);
                          handleSaveHeroSettings(defaults);
                        }}
                        style={{
                          width: '100%',
                          background: '#f8fafc',
                          color: '#334155',
                          border: '1px solid #cbd5e1',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                        title="Reset to original TRACE video and words"
                      >
                        <i className="fa-solid fa-rotate-left"></i> Reset to Original Video & Words
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeMenu === 'registrations' ? (
            /* VIEW 2: EVENT REGISTRATIONS VIEW (Matching exact reference screenshot) */
            <div className="manage-registrations-container">
              <div className="admin-dashboard-title-row">
                <div>
                  <h1 className="admin-page-title">Event Registrations</h1>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Manage attendees, view details, and export registration data.
                  </p>
                </div>
              </div>

              {/* Filter Toolbar Box */}
              <div className="reg-toolbar-panel">
                <div className="reg-toolbar-filters">
                  <div className="reg-filter-group">
                    <label>SELECT EVENT</label>
                    <select
                      className="reg-filter-select"
                      value={regEventFilter}
                      onChange={(e) => setRegEventFilter(e.target.value)}
                    >
                      <option value="all">All Events</option>
                      {events.map((evt) => (
                        <option key={evt._id} value={evt.title}>
                          {evt.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="reg-filter-group">
                    <label>STATUS FILTER</label>
                    <select
                      className="reg-filter-select"
                      value={regStatusFilter}
                      onChange={(e) => setRegStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Export Action Buttons */}
                <div className="reg-export-actions">
                  <button
                    type="button"
                    className="btn-export-excel"
                    onClick={handleExportExcel}
                    title="Download registration list as Excel (CSV) spreadsheet"
                  >
                    <i className="fa-solid fa-file-excel"></i> Export Excel
                  </button>
                  <button
                    type="button"
                    className="btn-export-pdf"
                    onClick={handleExportPDF}
                    title="Export / Print attendee list as PDF report"
                  >
                    <i className="fa-solid fa-file-pdf"></i> Export PDF
                  </button>
                </div>
              </div>

              {/* 2 Stat Cards Row */}
              <div className="reg-stats-grid" style={{ marginBottom: '1.5rem' }}>
                {/* Stat 1 */}
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">TOTAL REGISTERED</span>
                    <div className="stat-value">{totalRegsCount.toLocaleString()}</div>
                    <div className="stat-trend positive">
                      <i className="fa-solid fa-arrow-trend-up"></i> +12% this week
                    </div>
                  </div>
                  <div className="stat-icon-wrapper">
                    <i className="fa-solid fa-user-group"></i>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">CONFIRMED</span>
                    <div className="stat-value">{confirmedRegsCount.toLocaleString()}</div>
                    <div className="stat-trend positive-pill">89% completion</div>
                  </div>
                  <div className="stat-icon-wrapper">
                    <i className="fa-regular fa-circle-check"></i>
                  </div>
                </div>
              </div>

              {/* Registrations Data Table Card */}
              <div className="admin-card-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive-wrapper">
                  <table className="admin-data-table reg-table-interactive">
                    <thead>
                      <tr>
                        <th>FULL NAME</th>
                        <th>EMAIL</th>
                        <th>CONTACT NUMBER</th>
                        <th>EVENT</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            No registration records found.
                          </td>
                        </tr>
                      ) : (
                        displayedRegistrations.map((reg) => {
                          const currentStatus = reg.status || 'Confirmed';
                          const statusClass =
                            currentStatus === 'Confirmed'
                              ? 'confirmed'
                              : currentStatus === 'Pending'
                                ? 'pending'
                                : 'cancelled';

                          return (
                            <tr
                              key={reg._id}
                              className={`reg-row-clickable ${selectedReg?._id === reg._id ? 'selected-row' : ''
                                }`}
                              onClick={() => setSelectedReg(reg)}
                            >
                              <td>
                                <strong className="registrant-name">{reg.name}</strong>
                              </td>
                              <td>
                                <span className="registrant-email">{reg.email}</span>
                              </td>
                              <td>
                                <span className="cell-contact-text">{reg.contactNumber || '+94 77 123 4567'}</span>
                              </td>
                              <td>
                                <span className="cell-event-title">{reg.eventTitle || 'Tech Summit 2024'}</span>
                              </td>
                              <td onClick={(e) => e.stopPropagation()}>
                                <select
                                  className={`status-pill-select ${statusClass}`}
                                  value={currentStatus}
                                  onChange={(e) => handleDirectStatusChange(reg._id, e.target.value)}
                                  style={{
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '0.82rem',
                                    fontWeight: '700',
                                    border: '1px solid transparent',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    backgroundColor: currentStatus === 'Confirmed' ? '#dcfce7' : currentStatus === 'Pending' ? '#fef3c7' : '#fee2e2',
                                    color: currentStatus === 'Confirmed' ? '#15803d' : currentStatus === 'Pending' ? '#b45309' : '#b91c1c'
                                  }}
                                >
                                  <option value="Confirmed" style={{ background: '#fff', color: '#0f172a' }}>Confirmed</option>
                                  <option value="Pending" style={{ background: '#fff', color: '#0f172a' }}>Pending</option>
                                  <option value="Cancelled" style={{ background: '#fff', color: '#0f172a' }}>Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Bar */}
                <div className="table-pagination-bar">
                  <span className="pagination-info">
                    Showing 1 to {displayedRegistrations.length} of {registrations.length} entries
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
          ) : activeMenu === 'users' ? (
            /* VIEW: REGISTERED APP USERS & BRANCH ADMINS DIRECTORY VIEW */
            <div className="manage-registrations-container">
              <div className="admin-dashboard-title-row">
                <div>
                  <h1 className="admin-page-title">Registered Members & Branch Access Control</h1>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
                    View registered platform users, assign branch admins for individual hubs, set permissions, and send credential emails.
                  </p>
                </div>
                <button
                  className="btn-create-event-blue"
                  onClick={() => setShowAddBranchAdminModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <i className="fa-solid fa-user-shield"></i> Assign New Branch Admin
                </button>
              </div>

              {/* Stats Row */}
              <div className="reg-stats-grid" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">TOTAL REGISTERED MEMBERS</span>
                    <div className="stat-value">{registeredUsers.length}</div>
                    <div className="stat-trend positive">
                      <i className="fa-solid fa-users"></i> Platform Accounts
                    </div>
                  </div>
                  <div className="stat-icon-wrapper">
                    <i className="fa-solid fa-user-check"></i>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">BRANCH ADMINS</span>
                    <div className="stat-value" style={{ color: '#5d4df6' }}>
                      {registeredUsers.filter((u) => u.role === 'branch_admin' || u.role === 'admin').length}
                    </div>
                    <div className="stat-trend positive-pill">Hub Administrators</div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#5d4df6' }}>
                    <i className="fa-solid fa-user-shield"></i>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <span className="stat-label">ACTIVE TRACE BRANCHES</span>
                    <div className="stat-value" style={{ color: '#059669' }}>6</div>
                    <div className="stat-trend positive">Colombo, Kandy, Galle, Jaffna</div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#059669' }}>
                    <i className="fa-solid fa-building"></i>
                  </div>
                </div>
              </div>

              {/* Users & Branch Admins Data Table */}
              <div className="admin-card-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Role Filter Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderBottom: '1px solid #eaecf0', background: '#f8fafc', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setUserRoleFilter('all')}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: userRoleFilter === 'all' ? '#ffffff' : 'transparent',
                        color: userRoleFilter === 'all' ? '#5d4df6' : '#64748b',
                        boxShadow: userRoleFilter === 'all' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fa-solid fa-users"></i> All Members
                      <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '12px', background: userRoleFilter === 'all' ? '#eef2ff' : '#cbd5e1', color: userRoleFilter === 'all' ? '#5d4df6' : '#475569' }}>
                        {registeredUsers.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserRoleFilter('admins')}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: userRoleFilter === 'admins' ? '#ffffff' : 'transparent',
                        color: userRoleFilter === 'admins' ? '#5d4df6' : '#64748b',
                        boxShadow: userRoleFilter === 'admins' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fa-solid fa-user-shield"></i> Admins Only
                      <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '12px', background: userRoleFilter === 'admins' ? '#eef2ff' : '#cbd5e1', color: userRoleFilter === 'admins' ? '#5d4df6' : '#475569' }}>
                        {registeredUsers.filter((u) => u.role === 'admin' || u.role === 'super_admin' || u.role === 'branch_admin').length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUserRoleFilter('users')}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: userRoleFilter === 'users' ? '#ffffff' : 'transparent',
                        color: userRoleFilter === 'users' ? '#5d4df6' : '#64748b',
                        boxShadow: userRoleFilter === 'users' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <i className="fa-solid fa-user"></i> Regular Users
                      <span style={{ fontSize: '0.72rem', padding: '2px 7px', borderRadius: '12px', background: userRoleFilter === 'users' ? '#eef2ff' : '#cbd5e1', color: userRoleFilter === 'users' ? '#5d4df6' : '#475569' }}>
                        {registeredUsers.filter((u) => u.role !== 'admin' && u.role !== 'super_admin' && u.role !== 'branch_admin').length}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="table-responsive-wrapper">
                  <table className="admin-data-table members-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '22%' }}>USER / ADMIN</th>
                        <th style={{ width: '22%' }}>EMAIL ADDRESS</th>
                        <th style={{ width: '20%' }}>ASSIGNED BRANCH</th>
                        <th style={{ width: '16%' }}>ROLE & PERMISSIONS</th>
                        <th style={{ width: '12%' }}>REGISTERED DATE</th>
                        <th style={{ width: '8%', textAlign: 'center' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem', color: '#64748b' }}>
                            No registered user accounts found.
                          </td>
                        </tr>
                      ) : (
                        registeredUsers
                          .filter((u) => {
                            const isAdmin = u.role === 'admin' || u.role === 'super_admin' || u.role === 'branch_admin';
                            if (userRoleFilter === 'admins' && !isAdmin) return false;
                            if (userRoleFilter === 'users' && isAdmin) return false;

                            if (!searchQuery) return true;
                            const q = searchQuery.toLowerCase();
                            return (
                              u.name.toLowerCase().includes(q) ||
                              u.email.toLowerCase().includes(q) ||
                              (u.branch && u.branch.toLowerCase().includes(q)) ||
                              (u.contactNumber && u.contactNumber.includes(q))
                            );
                          })
                          .map((u) => (
                            <tr key={u._id || u.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                  <img
                                    src={
                                      u.avatar ||
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=5d4df6&color=fff&size=80`
                                    }
                                    alt={u.name}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '2px solid #eef2ff',
                                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                                    }}
                                  />
                                  <div>
                                    <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '0.94rem' }}>{u.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span style={{ color: '#4f46e5', fontWeight: '500', fontSize: '0.88rem' }}>{u.email}</span>
                              </td>
                              <td>
                                <span style={{ fontSize: '0.86rem', fontWeight: '600', color: '#1e293b' }}>
                                  {u.branch || 'TRACE Main (Colombo)'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <span
                                    style={{
                                      padding: '4px 12px',
                                      borderRadius: '9999px',
                                      fontSize: '0.78rem',
                                      fontWeight: '700',
                                      display: 'inline-block',
                                      width: 'fit-content',
                                      backgroundColor:
                                        u.role === 'admin' || u.role === 'super_admin'
                                          ? '#eff6ff'
                                          : u.role === 'branch_admin'
                                            ? '#f0fdf4'
                                            : '#f1f5f9',
                                      color:
                                        u.role === 'admin' || u.role === 'super_admin'
                                          ? '#5d4df6'
                                          : u.role === 'branch_admin'
                                            ? '#16a34a'
                                            : '#475569',
                                      border:
                                        u.role === 'admin' || u.role === 'super_admin'
                                          ? '1px solid #bfdbfe'
                                          : u.role === 'branch_admin'
                                            ? '1px solid #bbf7d0'
                                            : '1px solid #cbd5e1',
                                    }}
                                  >
                                    {u.role === 'admin'
                                      ? '● Super Admin'
                                      : u.role === 'branch_admin'
                                        ? '● Branch Admin'
                                        : 'User Member'}
                                  </span>
                                  {u.permissions && u.permissions.length > 0 && (
                                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                      {u.permissions.map((p) => p.replace('manage_', '')).join(', ')}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span style={{ color: '#475569', fontSize: '0.86rem', fontWeight: '500' }}>
                                  {u.createdAt
                                    ? new Date(u.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                    : 'N/A'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '0.5rem',
                                    width: '112px',
                                  }}
                                >
                                  {(u.role === 'branch_admin' || u.role === 'admin' || u.role === 'super_admin') && (
                                    <>
                                      <button
                                        className="icon-btn-action"
                                        title="Edit Admin Details & Avatar Upload"
                                        onClick={() => {
                                          setEditingAdminUser(u);
                                          setEditingAdminForm({
                                            name: u.name || '',
                                            branch: u.branch || 'TRACE Expert City (Colombo)',
                                            permissions: u.permissions || ['manage_events', 'manage_registrations'],
                                            avatar: u.avatar || '',
                                          });
                                        }}
                                        style={{ color: '#5d4df6', background: '#eef2ff', border: '1px solid #bfdbfe' }}
                                      >
                                        <i className="fa-solid fa-user-pen"></i>
                                      </button>

                                      <button
                                        className="icon-btn-action"
                                        title="Resend Credentials Email to Branch Admin"
                                        onClick={() => handleSendEmailCredentials(u)}
                                        style={{ color: '#5d4df6', background: '#eff6ff', border: '1px solid #bfdbfe' }}
                                      >
                                        <i className="fa-solid fa-paper-plane"></i>
                                      </button>
                                    </>
                                  )}
                                  <button
                                    className="icon-btn-action danger"
                                    title="Delete User"
                                    onClick={async () => {
                                      if (
                                        window.confirm(
                                          `Are you sure you want to delete user account "${u.name}" (${u.email})?`
                                        )
                                      ) {
                                        try {
                                          const authToken = localStorage.getItem('eventhub_token') || token;
                                          const res = await fetch(`/api/auth/users/${u._id}`, {
                                            method: 'DELETE',
                                            headers: {
                                              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                                            },
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            setRegisteredUsers((prev) => prev.filter((item) => item._id !== u._id));
                                            if (showToast) showToast(`Deleted user account ${u.email}`, 'success');
                                          } else {
                                            if (showToast) showToast(data.message || 'Failed to delete user', 'error');
                                          }
                                        } catch (err) {
                                          console.error('Error deleting user:', err);
                                          if (showToast) showToast('Network error deleting user', 'error');
                                        }
                                      }
                                    }}
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
              </div>
            </div>
          ) : activeMenu === 'venues' ? (
            /* VIEW: VENUES MANAGEMENT VIEW */
            <div className="manage-venues-container">
              <div className="admin-dashboard-title-row">
                <div>
                  <h1 className="admin-page-title">Spaces & Facilities</h1>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Manage event spaces, seating capacity, and hall reservations.
                  </p>
                </div>
                <button
                  className="btn-create-event-blue"
                  onClick={() => setShowAddVenueModal(true)}
                >
                  <i className="fa-solid fa-plus"></i> Add New Space
                </button>
              </div>

              {/* ADMIN SPACES FILTER BAR */}
              <div className="admin-filter-bar-card" style={{ background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <i className="fa-solid fa-filter" style={{ color: '#5d4df6', fontSize: '1rem' }}></i>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Filter Spaces ({displayedVenues.length} of {venues.length})</h3>
                  </div>
                  {(venueSearchQuery || venueBranchFilter !== 'all' || venueStatusFilter !== 'all' || venueTypeFilter !== 'all' || venueCapacityFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setVenueSearchQuery('');
                        setVenueBranchFilter('all');
                        setVenueStatusFilter('all');
                        setVenueTypeFilter('all');
                        setVenueCapacityFilter('all');
                      }}
                      style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s' }}
                    >
                      <i className="fa-solid fa-rotate-left"></i> Reset Filters
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
                  {/* 1. Search Query */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Search Space</label>
                    <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
                      <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem', pointerEvents: 'none', zIndex: 1 }}></i>
                      <input
                        type="text"
                        placeholder="Search space name, address..."
                        value={venueSearchQuery}
                        onChange={(e) => setVenueSearchQuery(e.target.value)}
                        style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem 0.6rem 2.3rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none' }}
                      />
                    </div>
                  </div>

                  {/* 2. Location Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Location</label>
                    <select
                      value={venueBranchFilter}
                      onChange={(e) => setVenueBranchFilter(e.target.value)}
                      style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="all">All Locations</option>
                      <option value="TRACE Expert City Colombo 10">TRACE Expert City Colombo 10</option>
                      <option value="TRACE Coworking Colombo 02">TRACE Coworking Colombo 02</option>
                      <option value="TRACE Coworking Jaffna City">TRACE Coworking Jaffna City</option>
                      <option value="TRACE BREAD Center, Makandura">TRACE BREAD Center, Makandura</option>
                      <option value="TRACE Creators Space, Rathnapura">TRACE Creators Space, Rathnapura</option>
                      <option value="Innovator Park - Kandy">Innovator Park - Kandy</option>
                      <option value="ASAYA Workation By the Sea">ASAYA Workation By the Sea</option>
                      <option value="UVA Co-Working Space">UVA Co-Working Space</option>
                    </select>
                  </div>

                  {/* 3. Availability Status Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Status</label>
                    <select
                      value={venueStatusFilter}
                      onChange={(e) => setVenueStatusFilter(e.target.value)}
                      style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </select>
                  </div>

                  {/* 4. Space Type Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Space Type</label>
                    <select
                      value={venueTypeFilter}
                      onChange={(e) => setVenueTypeFilter(e.target.value)}
                      style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="all">All Space Types</option>
                      <option value="Meeting Room">Meeting Room</option>
                      <option value="Co-Working">Co-Working Space</option>
                      <option value="Auditorium">Auditorium & Hall</option>
                      <option value="Event Space">Event Space</option>
                    </select>
                  </div>

                  {/* 5. Capacity Filter */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0, margin: 0 }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block' }}>Seating Capacity</label>
                    <select
                      value={venueCapacityFilter}
                      onChange={(e) => setVenueCapacityFilter(e.target.value)}
                      style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', height: '42px', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="all">Any Capacity</option>
                      <option value="small">Small (&lt; 100 Seats)</option>
                      <option value="medium">Medium (100 - 200 Seats)</option>
                      <option value="large">Large (&gt; 200 Seats)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Venues Grid */}
              {displayedVenues.length === 0 ? (
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '3rem 1.5rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    <i className="fa-solid fa-building-circle-xmark"></i>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>No Spaces Match Your Filters</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Try adjusting your search query, branch selector, or capacity limits.</p>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ marginTop: '1.25rem' }}
                    onClick={() => {
                      setVenueSearchQuery('');
                      setVenueBranchFilter('all');
                      setVenueStatusFilter('all');
                      setVenueCapacityFilter('all');
                    }}
                  >
                    <i className="fa-solid fa-rotate-left"></i> Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="venues-grid-2col">
                  {displayedVenues.map((v) => {
                    const venueId = v._id || v.id;
                    const formattedAddress = (v.address || '').replace(/,/g, ', ');
                    const isDemand = v.isOnDemand || (v.rentalPrice && v.rentalPrice.toLowerCase().includes('demand')) || (!v.rentalPrice && (!v.pricePerHour || Number(v.pricePerHour) <= 0));
                    const priceDisplay = v.rentalPrice || (isDemand ? 'On Demand' : (v.pricePerHour ? `Rs. ${Number(v.pricePerHour).toLocaleString()} / hr` : 'On Demand'));

                    return (
                      <div key={venueId || Math.random()} className="admin-venue-card">
                        <div className="admin-venue-card-banner-wrapper">
                          {v.coverImage && typeof v.coverImage === 'string' && v.coverImage.trim().length > 0 && !v.coverImage.includes('photo-1517457373958-b7bdd4587205') && !v.coverImage.includes('photo-1540575467063-178a50c2df87') ? (
                            <img
                              src={v.coverImage}
                              alt={v.name}
                              className="admin-venue-card-banner"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.parentElement?.querySelector('.admin-venue-no-image-banner');
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className="admin-venue-no-image-banner"
                            style={{
                              display: v.coverImage && typeof v.coverImage === 'string' && v.coverImage.trim().length > 0 && !v.coverImage.includes('photo-1517457373958-b7bdd4587205') && !v.coverImage.includes('photo-1540575467063-178a50c2df87') ? 'none' : 'flex'
                            }}
                          >
                            <i className="fa-regular fa-image" style={{ fontSize: '1.75rem', color: '#94a3b8' }}></i>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>No Photo</span>
                          </div>
                        </div>
                        <div className="admin-venue-card-body">
                          <div className="admin-venue-badges-row">
                            <span className={`admin-venue-status-pill ${v.status === 'Available' ? 'available' : 'reserved'}`}>
                              <span className="admin-venue-status-dot"></span>
                              {v.status || 'Available'}
                            </span>
                            {v.branch && (
                              <span className="admin-venue-branch-tag" title={v.branch}>
                                <i className="fa-solid fa-location-dot" style={{ fontSize: '0.7rem' }}></i>
                                {v.branch}
                              </span>
                            )}
                          </div>

                          <h3 className="admin-venue-card-title">{v.name}</h3>

                          <div className="admin-venue-location">
                            <i className="fa-solid fa-location-dot"></i>
                            <span title={formattedAddress}>{formattedAddress}</span>
                          </div>

                          {/* Structured Stats Grid for Uniform Height & Alignment */}
                          <div className="admin-venue-stats-grid">
                            <div className="admin-venue-stat-box">
                              <div className="admin-venue-stat-label">
                                <i className="fa-solid fa-users"></i> Capacity
                              </div>
                              <div className="admin-venue-stat-val">
                                {typeof v.capacity === 'number' && v.capacity > 0
                                  ? `${v.capacity} Seats`
                                  : !isNaN(Number(v.capacity)) && Number(v.capacity) > 0
                                    ? `${Number(v.capacity)} Seats`
                                    : (v.capacity && String(v.capacity).trim() !== '' && v.capacity !== 0 && v.capacity !== '0'
                                      ? v.capacity
                                      : 'Custom Setup')}
                              </div>
                            </div>
                            <div className="admin-venue-stat-box">
                              <div className="admin-venue-stat-label">
                                <i className="fa-solid fa-tag"></i> {typeof priceDisplay === 'string' && priceDisplay.includes('/ day') ? 'Rate / Day' : (isDemand ? 'Rate' : 'Rate / Hr')}
                              </div>
                              <div
                                className="admin-venue-stat-val rate-val"
                                style={isDemand ? { color: '#059669', fontWeight: 800 } : {}}
                                title={priceDisplay}
                              >
                                {priceDisplay}
                              </div>
                            </div>
                          </div>

                          {/* Amenities Tags with consistent min-height */}
                          <div className="admin-venue-amenities-section">
                            <div className="admin-venue-amenities-tags">
                              {v.amenities && v.amenities.map((am, i) => (
                                <span key={i} className="admin-venue-amenity-chip">
                                  <i className="fa-solid fa-check"></i> {am}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Card Bottom Actions: Level baseline pinned to bottom */}
                          <div className="admin-venue-card-actions">
                            <button
                              type="button"
                              className="admin-btn-schedule"
                              onClick={() => showToast && showToast(`Booking schedule checked for "${v.name}"`, 'info')}
                            >
                              <i className="fa-regular fa-calendar-check"></i> Check Schedule
                            </button>
                            <button
                              type="button"
                              className="admin-btn-edit-venue"
                              onClick={() => setEditingVenue(v)}
                              title="Edit Venue Facility"
                            >
                              <i className="fa-regular fa-pen-to-square"></i> Edit Facility
                            </button>
                            <button
                              type="button"
                              className="admin-btn-delete-venue"
                              title="Delete Space"
                              onClick={async () => {
                                if (!venueId) return;
                                if (window.confirm(`Are you sure you want to delete venue "${v.name}"?`)) {
                                  try {
                                    const authToken = localStorage.getItem('eventhub_token') || token;
                                    const res = await fetch(`/api/venues/${venueId}`, {
                                      method: 'DELETE',
                                      headers: {
                                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                                      },
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                      notifyVenueUpdated({ _id: venueId, id: venueId, deleted: true });
                                      setVenues((prev) => prev.filter((item) => (item._id || item.id) !== venueId));
                                      if (showToast) showToast(`Deleted venue "${v.name}" successfully!`, 'success');
                                    } else {
                                      notifyVenueUpdated({ _id: venueId, id: venueId, deleted: true });
                                      setVenues((prev) => prev.filter((item) => (item._id || item.id) !== venueId));
                                      if (showToast) showToast(data.message || `Deleted venue "${v.name}"`, 'info');
                                    }
                                  } catch (err) {
                                    console.error('Error deleting venue:', err);
                                    notifyVenueUpdated({ _id: venueId, id: venueId, deleted: true });
                                    setVenues((prev) => prev.filter((item) => (item._id || item.id) !== venueId));
                                    if (showToast) showToast(`Deleted venue "${v.name}"`, 'info');
                                  }
                                }
                              }}
                            >
                              <i className="fa-regular fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeMenu === 'inquiries' ? (
            /* VIEW: SPACE & VENUE INQUIRIES VIEW */
            <div className="manage-inquiries-container">
              <div className="admin-dashboard-title-row">
                <div>
                  <h1 className="admin-page-title">Space & Facility Inquiries</h1>
                  <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Customer booking requests submitted for TRACE spaces. Real-time notifications are automatically dispatched to <strong>connect@trace.lk</strong>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => fetchDashboardData(true)}
                    style={{ background: '#ffffff', color: '#475569', borderColor: '#cbd5e1' }}
                    title="Refresh inquiries list from server"
                  >
                    <i className="fa-solid fa-rotate"></i> Refresh
                  </button>
                  <button
                    type="button"
                    className="btn-export-excel"
                    onClick={handleExportInquiriesCSV}
                    title="Export filtered inquiries to CSV"
                  >
                    <i className="fa-solid fa-file-excel"></i> Export CSV
                  </button>
                </div>
              </div>

              {/* Status Counters Strip */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setInquiryStatusFilter('all')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: inquiryStatusFilter === 'all' ? '#5d4df6' : '#cbd5e1',
                    background: inquiryStatusFilter === 'all' ? '#5d4df6' : '#ffffff',
                    color: inquiryStatusFilter === 'all' ? '#ffffff' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  All Inquiries <span style={{ opacity: 0.85 }}>({venueBookings.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInquiryStatusFilter('Pending')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: inquiryStatusFilter === 'Pending' ? '#d97706' : '#fde68a',
                    background: inquiryStatusFilter === 'Pending' ? '#d97706' : '#fef3c7',
                    color: inquiryStatusFilter === 'Pending' ? '#ffffff' : '#92400e',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ● Pending <span style={{ opacity: 0.85 }}>({pendingInquiriesCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInquiryStatusFilter('Contacted')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: inquiryStatusFilter === 'Contacted' ? '#2563eb' : '#bfdbfe',
                    background: inquiryStatusFilter === 'Contacted' ? '#2563eb' : '#eff6ff',
                    color: inquiryStatusFilter === 'Contacted' ? '#ffffff' : '#1e40af',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ● Contacted <span style={{ opacity: 0.85 }}>({contactedInquiriesCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInquiryStatusFilter('Confirmed')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: inquiryStatusFilter === 'Confirmed' ? '#059669' : '#a7f3d0',
                    background: inquiryStatusFilter === 'Confirmed' ? '#059669' : '#ecfdf5',
                    color: inquiryStatusFilter === 'Confirmed' ? '#ffffff' : '#065f46',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ● Confirmed <span style={{ opacity: 0.85 }}>({confirmedInquiriesCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInquiryStatusFilter('Cancelled')}
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: inquiryStatusFilter === 'Cancelled' ? '#dc2626' : '#fecaca',
                    background: inquiryStatusFilter === 'Cancelled' ? '#dc2626' : '#fef2f2',
                    color: inquiryStatusFilter === 'Cancelled' ? '#ffffff' : '#991b1b',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  ● Cancelled <span style={{ opacity: 0.85 }}>({cancelledInquiriesCount})</span>
                </button>
              </div>

              {/* Filter Toolbar Panel */}
              <div className="reg-toolbar-panel" style={{ marginBottom: '1.25rem' }}>
                <div className="reg-toolbar-filters" style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                  {/* Search Bar */}
                  <div style={{ flex: '1 1 280px', position: 'relative' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}></i>
                    <input
                      type="text"
                      placeholder="Search by ref, inquirer, email, space name..."
                      value={inquirySearchQuery}
                      onChange={(e) => setInquirySearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem 0.6rem 2.25rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                    />
                  </div>

                  {/* Branch Filter */}
                  <div style={{ minWidth: '180px' }}>
                    <select
                      value={inquiryBranchFilter}
                      onChange={(e) => setInquiryBranchFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        background: '#ffffff',
                        color: '#0f172a',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="all">All Locations</option>
                      {allVenueBranches.map((br) => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div style={{ minWidth: '160px' }}>
                    <select
                      value={inquiryStatusFilter}
                      onChange={(e) => setInquiryStatusFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.88rem',
                        background: '#ffffff',
                        color: '#0f172a',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {(inquirySearchQuery || inquiryBranchFilter !== 'all' || inquiryStatusFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setInquirySearchQuery('');
                        setInquiryBranchFilter('all');
                        setInquiryStatusFilter('all');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#5d4df6',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        padding: '0.4rem 0.6rem',
                        textDecoration: 'underline',
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Inquiries Table Card */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                {displayedVenueBookings.length === 0 ? (
                  <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff', color: '#5d4df6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>
                      <i className="fa-solid fa-envelope-open-text"></i>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem 0' }}>No Inquiries Found</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                      No space inquiries match your current filters. Incoming inquiries will appear here and email <strong>connect@trace.lk</strong> automatically.
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          <th style={{ padding: '1rem 1.25rem' }}>Ref #</th>
                          <th style={{ padding: '1rem 1.25rem' }}>Space / Venue</th>
                          <th style={{ padding: '1rem 1.25rem' }}>Inquirer Details</th>
                          <th style={{ padding: '1rem 1.25rem' }}>Event Details</th>
                          <th style={{ padding: '1rem 1.25rem' }}>Notes</th>
                          <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                          <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedVenueBookings.map((bk) => {
                          const statusBg =
                            bk.status === 'Confirmed' ? '#ecfdf5' :
                              bk.status === 'Contacted' ? '#eff6ff' :
                                bk.status === 'Cancelled' ? '#fef2f2' : '#fef3c7';
                          const statusColor =
                            bk.status === 'Confirmed' ? '#065f46' :
                              bk.status === 'Contacted' ? '#1e40af' :
                                bk.status === 'Cancelled' ? '#991b1b' : '#92400e';
                          const statusBorder =
                            bk.status === 'Confirmed' ? '#a7f3d0' :
                              bk.status === 'Contacted' ? '#bfdbfe' :
                                bk.status === 'Cancelled' ? '#fecaca' : '#fde68a';

                          return (
                            <tr
                              key={bk._id || bk.bookingRef}
                              style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                            >
                              <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                <span style={{ background: '#eef2ff', color: '#5d4df6', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                                  {bk.bookingRef}
                                </span>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                                  {new Date(bk.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </div>
                              </td>

                              <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{bk.venueName}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <i className="fa-solid fa-location-dot" style={{ fontSize: '0.7rem' }}></i> {bk.branch}
                                </div>
                                {bk.price && (
                                  <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.74rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                                    {bk.price}
                                  </span>
                                )}
                              </td>

                              <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{bk.name}</div>
                                <div>
                                  <a href={`mailto:${bk.email}`} style={{ color: '#5d4df6', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <i className="fa-regular fa-envelope"></i> {bk.email}
                                  </a>
                                </div>
                                <div>
                                  <a href={`tel:${bk.phone}`} style={{ color: '#059669', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <i className="fa-solid fa-phone"></i> {bk.phone}
                                  </a>
                                </div>
                              </td>

                              <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{bk.eventTitle}</div>
                                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '3px' }}>
                                  📅 <strong>{bk.eventDate}</strong> ({bk.durationHours || 4} hrs)
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                                  👥 {bk.guests || 50} Expected Guests
                                </div>
                              </td>

                              <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', maxWidth: '240px' }}>
                                {bk.notes ? (
                                  <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontStyle: 'italic', lineHeight: 1.4 }}>
                                    "{bk.notes}"
                                  </div>
                                ) : (
                                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>None</span>
                                )}
                              </td>

                              <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top' }}>
                                <select
                                  value={bk.status || 'Pending'}
                                  onChange={(e) => handleUpdateBookingStatus(bk._id || bk.id, e.target.value)}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    border: `1px solid ${statusBorder}`,
                                    background: statusBg,
                                    color: statusColor,
                                    fontWeight: 800,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer',
                                    outline: 'none',
                                  }}
                                >
                                  <option value="Pending">● Pending</option>
                                  <option value="Contacted">● Contacted</option>
                                  <option value="Confirmed">● Confirmed</option>
                                  <option value="Cancelled">● Cancelled</option>
                                </select>
                              </td>

                              <td style={{ padding: '1rem 1.25rem', verticalAlign: 'top', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '6px' }}>
                                  <a
                                    href={`mailto:${bk.email}?subject=RE: TRACE Space Inquiry [${bk.bookingRef}] - ${bk.venueName}&body=Hi ${bk.name},%0D%0A%0D%0AThank you for inquiring about ${bk.venueName}.`}
                                    className="btn btn-outline"
                                    style={{ padding: '5px 9px', borderRadius: '6px', fontSize: '0.78rem', color: '#5d4df6', borderColor: '#c7d2fe', background: '#eff6ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    title="Reply via Email"
                                  >
                                    <i className="fa-solid fa-reply"></i> Reply
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBooking(bk._id || bk.id, bk.bookingRef)}
                                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '5px 9px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                                    title="Delete Inquiry"
                                  >
                                    <i className="fa-regular fa-trash-can"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
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
                                    evt.coverImage ||
                                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'
                                  }
                                  alt={evt.title}
                                  className="event-thumb"
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
                                    evt.coverImage ||
                                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'
                                  }
                                  alt={evt.title}
                                  className="event-thumb"
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

      {/* REGISTRATION DETAILS SLIDE-OVER DRAWER (Matching exact reference screenshot) */}
      {selectedReg && (
        <div className="drawer-backdrop" onClick={() => setSelectedReg(null)}>
          <aside className="registration-details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Registration Details</h2>
              <button className="btn-close-drawer" onClick={() => setSelectedReg(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="drawer-body-content">
              {/* User Avatar & Name Section */}
              <div className="drawer-user-section">
                <div className="drawer-avatar-circle">
                  {getInitials(selectedReg.name)}
                </div>
                <div>
                  <h3 className="drawer-user-name">{selectedReg.name}</h3>
                  <p className="drawer-user-role">Senior Developer at Corp Inc.</p>
                </div>
              </div>

              {/* CURRENT STATUS Box */}
              <div className="drawer-status-card">
                <div className="drawer-status-header">
                  <span className="drawer-section-label">CURRENT STATUS</span>
                  <button
                    type="button"
                    className="btn-change-status-link"
                    onClick={() => setIsChangingStatus(!isChangingStatus)}
                  >
                    Change
                  </button>
                </div>

                {isChangingStatus ? (
                  <select
                    className="drawer-status-select"
                    value={editingRegStatus}
                    onChange={(e) => setEditingRegStatus(e.target.value)}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                ) : (
                  <div className="current-status-value">
                    <span
                      className={`status-indicator-dot ${editingRegStatus === 'Confirmed'
                        ? 'dot-confirmed'
                        : editingRegStatus === 'Pending'
                          ? 'dot-pending'
                          : 'dot-cancelled'
                        }`}
                    ></span>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{editingRegStatus}</strong>
                  </div>
                )}
              </div>

              {/* EVENT INFORMATION */}
              <div className="drawer-section-group">
                <span className="drawer-section-label">EVENT INFORMATION</span>

                <div className="drawer-info-row">
                  <span className="info-key">Event Name</span>
                  <div className="info-val-strong">{selectedReg.eventTitle || 'Tech Summit 2024'}</div>
                </div>

                <div className="drawer-info-row">
                  <span className="info-key">Registration Date</span>
                  <div className="info-val-muted">
                    {selectedReg.createdAt
                      ? new Date(selectedReg.createdAt).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'October 24, 2023 at 10:45 AM'}
                  </div>
                </div>
              </div>

              {/* CONTACT DETAILS */}
              <div className="drawer-section-group">
                <span className="drawer-section-label">CONTACT DETAILS</span>

                <div className="drawer-info-row">
                  <span className="info-key">Email Address</span>
                  <div className="info-val-copy">
                    <span>{selectedReg.email}</span>
                    <button
                      type="button"
                      className="btn-copy-icon"
                      onClick={() => copyToClipboard(selectedReg.email)}
                      title="Copy Email"
                    >
                      <i className="fa-regular fa-copy"></i>
                    </button>
                  </div>
                </div>

                <div className="drawer-info-row">
                  <span className="info-key">Phone Number</span>
                  <div className="info-val-muted">{selectedReg.contactNumber || '+94 77 123 4567'}</div>
                </div>
              </div>

              {/* ADMIN NOTES */}
              <div className="drawer-section-group">
                <div className="drawer-notes-header">
                  <span className="drawer-section-label">ADMIN NOTES</span>
                  <button
                    type="button"
                    className="btn-edit-note-link"
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                  >
                    <i className="fa-regular fa-pen-to-square"></i> Edit Note
                  </button>
                </div>

                {isEditingNotes ? (
                  <textarea
                    rows="3"
                    className="drawer-notes-textarea"
                    value={editingRegNotes}
                    onChange={(e) => setEditingRegNotes(e.target.value)}
                  ></textarea>
                ) : (
                  <div className="drawer-notes-box">
                    <p>"{editingRegNotes}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Footer Actions */}
            <div className="drawer-footer-actions">
              <button
                type="button"
                className="btn-drawer-resend"
                onClick={() =>
                  showToast &&
                  showToast(`Resent ticket confirmation to ${selectedReg.email}`, 'success')
                }
              >
                Resend Ticket
              </button>

              <button
                type="button"
                className="btn-drawer-save"
                onClick={handleSaveRegistrationChanges}
                disabled={savingReg}
              >
                {savingReg ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Create Event Professional Modal Overlay */}
      {activeMenu === 'create-event' && (
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
      )}

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        event={editingEvent}
        token={token || localStorage.getItem('eventhub_token')}
        currentUser={currentUser}
        onEventUpdated={(updatedEvent) => {
          if (updatedEvent && updatedEvent._id) {
            setEvents((prev) =>
              prev.map((e) => (e._id === updatedEvent._id ? { ...e, ...updatedEvent } : e))
            );
          }
          if (onEventUpdated) onEventUpdated(updatedEvent);
          fetchDashboardData();
        }}
        showToast={showToast}
      />

      {/* Add / Edit Venue Modal */}
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
      {/* Assign Branch Admin Modal */}
      {showAddBranchAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAddBranchAdminModal(false)}>
          <div
            className="modal-card admin-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px', padding: '2rem' }}
          >
            <button className="modal-close" onClick={() => setShowAddBranchAdminModal(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-user-shield" style={{ color: '#5d4df6' }}></i>
                Assign Branch Admin & Grant Access
              </h2>
              <p className="modal-sub">
                Assign an admin for a specific TRACE branch. Credentials and assigned permissions will be dispatched to their email inbox automatically.
              </p>
            </div>

            <form onSubmit={handleCreateBranchAdmin}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Branch Admin Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Perera"
                  value={branchAdminForm.name}
                  onChange={(e) => setBranchAdminForm({ ...branchAdminForm, name: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kasun@trace.lk"
                    value={branchAdminForm.email}
                    onChange={(e) => setBranchAdminForm({ ...branchAdminForm, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Assign Temporary Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BranchAdmin@2026"
                    value={branchAdminForm.password}
                    onChange={(e) => setBranchAdminForm({ ...branchAdminForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label>Assigned TRACE Branch / Hub *</label>
                <select
                  value={branchAdminForm.branch}
                  onChange={(e) => setBranchAdminForm({ ...branchAdminForm, branch: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: '600' }}
                >
                  <option value="TRACE Expert City Colombo 10">TRACE Expert City Colombo 10</option>
                  <option value="HomeTree Coworking, Colombo 04">HomeTree Coworking, Colombo 04</option>
                  <option value="TRACE Coworking Colombo 02">TRACE Coworking Colombo 02</option>
                  <option value="TRACE Coworking Jaffna City">TRACE Coworking Jaffna City</option>
                  <option value="TRACE BREAD Center, Makandura">TRACE BREAD Center, Makandura</option>
                  <option value="TRACE - JRDC Incubator, Kandy">TRACE - JRDC Incubator, Kandy</option>
                  <option value="TRACE Creators Space, Rathnapura">TRACE Creators Space, Rathnapura</option>
                  <option value="TRACE Batticaloa">TRACE Batticaloa</option>
                  <option value="Southern Innovation Hub">Southern Innovation Hub</option>
                  <option value="UOK Innovation Hub">UOK Innovation Hub</option>
                  <option value="UWU Innovation Hub">UWU Innovation Hub</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>Granted Permissions & Control Scope</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {[
                    { id: 'manage_events', label: '📅 Create & Edit Branch Events' },
                    { id: 'manage_registrations', label: '👥 Manage Participant Registrations' },
                    { id: 'manage_spaces', label: '🏢 Manage Branch Spaces & Inquiries' },
                    { id: 'view_analytics', label: '📊 View Analytics & Reports' },
                  ].map((perm) => (
                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={branchAdminForm.permissions.includes(perm.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setBranchAdminForm((prev) => ({
                            ...prev,
                            permissions: checked
                              ? [...prev.permissions, perm.id]
                              : prev.permissions.filter((p) => p !== perm.id),
                          }));
                        }}
                        style={{ accentColor: '#5d4df6', width: '16px', height: '16px' }}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddBranchAdminModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#5d4df6', display: 'flex', alignItems: 'center', gap: '6px' }}
                  disabled={submittingBranchAdmin}
                >
                  {submittingBranchAdmin ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Assigning & Sending Mail...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Assign & Dispatch Credentials Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Administrator Account Details Modal (Admins Only) */}
      {editingAdminUser && (
        <div className="modal-overlay" onClick={() => setEditingAdminUser(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '620px', padding: '2rem', borderRadius: '16px' }}
          >
            <button className="modal-close" onClick={() => setEditingAdminUser(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-user-pen" style={{ color: '#5d4df6' }}></i>
                Edit Administrator Details & Avatar
              </h2>
              <p className="modal-sub">
                Update account name, assigned TRACE branch, Granted Permissions, and profile avatar photo for <strong style={{ color: '#5d4df6' }}>{editingAdminUser.email}</strong>.
              </p>
            </div>

            <form onSubmit={handleSaveAdminEdit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ marginBottom: '0.35rem', display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>
                  Administrator Email (Account Identifier)
                </label>
                <input
                  type="email"
                  value={editingAdminUser.email}
                  disabled
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', fontWeight: '600' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ marginBottom: '0.35rem', display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingAdminForm.name}
                  onChange={(e) => setEditingAdminForm({ ...editingAdminForm, name: e.target.value })}
                  placeholder="e.g. Kasun Kalhara"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ marginBottom: '0.35rem', display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>
                  Assigned TRACE Branch Location
                </label>
                <select
                  value={editingAdminForm.branch}
                  onChange={(e) => setEditingAdminForm({ ...editingAdminForm, branch: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                >
                  <option value="TRACE Expert City Colombo 10">TRACE Expert City Colombo 10</option>
                  <option value="HomeTree Coworking, Colombo 04">HomeTree Coworking, Colombo 04</option>
                  <option value="TRACE Coworking Colombo 02">TRACE Coworking Colombo 02</option>
                  <option value="TRACE Coworking Jaffna City">TRACE Coworking Jaffna City</option>
                  <option value="TRACE BREAD Center, Makandura">TRACE BREAD Center, Makandura</option>
                  <option value="TRACE - JRDC Incubator, Kandy">TRACE - JRDC Incubator, Kandy</option>
                  <option value="TRACE Creators Space, Rathnapura">TRACE Creators Space, Rathnapura</option>
                  <option value="TRACE Batticaloa">TRACE Batticaloa</option>
                  <option value="Southern Innovation Hub">Southern Innovation Hub</option>
                  <option value="UOK Innovation Hub">UOK Innovation Hub</option>
                  <option value="UWU Innovation Hub">UWU Innovation Hub</option>
                </select>
              </div>

              {/* Avatar Photo Upload & URL */}
              <div className="form-group" style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>
                  <i className="fa-solid fa-camera" style={{ color: '#5d4df6' }}></i>
                  Admin Avatar Photo (Upload or Image URL)
                </label>

                {editingAdminForm.avatar && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <img
                      src={editingAdminForm.avatar}
                      alt="Admin Avatar Preview"
                      style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #5d4df6' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '700', display: 'block' }}>✓ Current Avatar Loaded</span>
                      <button
                        type="button"
                        onClick={() => setEditingAdminForm({ ...editingAdminForm, avatar: '' })}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                )}

                <CloudinaryUploader
                  accept="image/*"
                  label="Upload New Admin Photo to Cloudinary"
                  onUploadSuccess={(url) => setEditingAdminForm({ ...editingAdminForm, avatar: url })}
                />

                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>Or Paste Image URL directly:</label>
                  <input
                    type="text"
                    value={editingAdminForm.avatar}
                    onChange={(e) => setEditingAdminForm({ ...editingAdminForm, avatar: e.target.value })}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Granted Permissions */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: '700', fontSize: '0.85rem' }}>Granted Permissions & Scope</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  {[
                    { id: 'manage_events', label: '📅 Create & Edit Branch Events' },
                    { id: 'manage_registrations', label: '👥 Manage Participant Registrations' },
                    { id: 'manage_spaces', label: '🏢 Manage Branch Spaces & Inquiries' },
                    { id: 'view_analytics', label: '📊 View Analytics & Reports' },
                  ].map((perm) => (
                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editingAdminForm.permissions.includes(perm.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setEditingAdminForm((prev) => ({
                            ...prev,
                            permissions: checked
                              ? [...prev.permissions, perm.id]
                              : prev.permissions.filter((p) => p !== perm.id),
                          }));
                        }}
                        style={{ accentColor: '#5d4df6', width: '16px', height: '16px' }}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingAdminUser(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#5d4df6', display: 'flex', alignItems: 'center', gap: '6px' }}
                  disabled={savingAdminEdit}
                >
                  {savingAdminEdit ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving Changes...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk"></i> Save Admin Details & Photo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Credentials Dispatch Notification Preview Modal */}
      {emailNotificationModalData && (
        <div className="modal-overlay" onClick={() => setEmailNotificationModalData(null)}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '580px', padding: '2rem', borderRadius: '16px' }}
          >
            <button className="modal-close" onClick={() => setEmailNotificationModalData(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '0.75rem' }}>
                <i className="fa-solid fa-envelope-circle-check"></i>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Email Notification Dispatched Successfully!
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginTop: '0.25rem' }}>
                A confirmation email with login credentials and permissions has been sent to the branch admin's inbox.
              </p>
            </div>

            {/* Email Card Graphic */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
              <div style={{ background: '#0f172a', color: '#ffffff', padding: '0.85rem 1.25rem', fontSize: '0.88rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span><i className="fa-solid fa-envelope" style={{ marginRight: '6px', color: '#38bdf8' }}></i> {emailNotificationModalData.subject}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sent Just Now</span>
              </div>

              <div style={{ padding: '1.25rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  Hello <strong>{emailNotificationModalData.adminName}</strong>,
                </div>
                <p style={{ margin: '0 0 1rem 0' }}>
                  You have been granted <strong>Branch Admin Access</strong> for <strong>{emailNotificationModalData.branchName}</strong> on the TRACE Event Hub platform.
                </p>

                <div style={{ background: '#f8fafc', border: '1px border-dashed #cbd5e1', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '0.35rem' }}>📧 <strong>Login Email:</strong> <span style={{ color: '#5d4df6', fontWeight: '600' }}>{emailNotificationModalData.email}</span></div>
                  <div style={{ marginBottom: '0.35rem' }}>🔑 <strong>Temporary Password:</strong> <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{emailNotificationModalData.temporaryPassword}</code></div>
                  <div>🏢 <strong>Assigned Branch:</strong> {emailNotificationModalData.branchName}</div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Granted Permissions:</strong>
                  <ul style={{ margin: '0.35rem 0 0 1.2rem', padding: 0, fontSize: '0.84rem' }}>
                    {emailNotificationModalData.grantedPermissions.map((p, idx) => (
                      <li key={idx} style={{ color: '#059669', fontWeight: '600' }}>✓ {p.replace('_', ' ').toUpperCase()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', backgroundColor: '#5d4df6', fontWeight: '700' }}
              onClick={() => setEmailNotificationModalData(null)}
            >
              Done & Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
