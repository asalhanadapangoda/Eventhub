import React, { useState, useEffect, useMemo } from 'react';
import FormattedText from './FormattedText';
import ImageCarouselSlider from './ImageCarouselSlider';
import { optimizeImageUrl } from '../utils/eventUtils';

// TRACE Branch metadata definition for rich display & badges
const TRACE_BRANCHES_META = [
  {
    id: 'TRACE Expert City Colombo 10',
    name: 'TRACE Expert City',
    location: 'Colombo 10, Western Province',
    shortName: 'Colombo 10 Hub',
    icon: 'fa-building-user',
    color: '#5d4df6',
    badgeBg: '#e60023',
    bannerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e1b4b 100%)',
    description: 'Flagship technology campus in Maradana featuring auditoriums, technology labs, and innovation deck.',
  },
  {
    id: 'HomeTree Coworking, Colombo 04',
    name: 'HomeTree Coworking',
    location: 'Colombo 04, Western Province',
    shortName: 'HomeTree Col 04',
    icon: 'fa-leaf',
    color: '#10b981',
    bannerGradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #0f172a 100%)',
    description: 'Eco-conscious modern coworking space, collaborative workshop zones, and creative meeting lounges.',
  },
  {
    id: 'TRACE Coworking Colombo 02',
    name: 'TRACE Coworking Col 02',
    location: 'Colombo 02, Western Province',
    shortName: 'Colombo 02 Hub',
    icon: 'fa-briefcase',
    color: '#3b82f6',
    bannerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0f172a 100%)',
    description: 'Dynamic urban coworking hub in central Colombo for corporate meetings and tech teams.',
  },
  {
    id: 'TRACE Coworking Jaffna City',
    name: 'TRACE Coworking Jaffna City',
    location: 'Jaffna City, Northern Province',
    shortName: 'Jaffna Hub',
    icon: 'fa-cubes-stacked',
    color: '#d97706',
    bannerGradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #1e293b 100%)',
    description: 'Northern innovation space fostering regional engineering, developer summits, and coding sprints.',
  },
  {
    id: 'TRACE BREAD Center, Makandura',
    name: 'TRACE BREAD Center',
    location: 'Makandura, North Western Province',
    shortName: 'Makandura Center',
    icon: 'fa-wheat-awn',
    color: '#f59e0b',
    bannerGradient: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #0f172a 100%)',
    description: 'Agri-tech, biotechnology, and rural innovation center in the North Western province.',
  },
  {
    id: 'TRACE - JRDC Incubator, Kandy',
    name: 'TRACE - JRDC Incubator',
    location: 'Peradeniya, Kandy, Central Province',
    shortName: 'Kandy Incubator',
    icon: 'fa-mountain-city',
    color: '#059669',
    bannerGradient: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f172a 100%)',
    description: 'Joint research & development campus in Kandy for AI innovation, academia collaboration, and maker labs.',
  },
  {
    id: 'TRACE Creators Space, Rathnapura',
    name: 'TRACE Creators Space',
    location: 'Rathnapura, Sabaragamuwa Province',
    shortName: 'Rathnapura Hub',
    icon: 'fa-gem',
    color: '#ec4899',
    bannerGradient: 'linear-gradient(135deg, #831843 0%, #db2777 50%, #0f172a 100%)',
    description: 'Creative technology deck empowering young digital creators and tech startups in Sabaragamuwa.',
  },
  {
    id: 'TRACE Batticaloa',
    name: 'TRACE Batticaloa',
    location: 'Batticaloa, Eastern Province',
    shortName: 'Batticaloa Hub',
    icon: 'fa-network-wired',
    color: '#06b6d4',
    bannerGradient: 'linear-gradient(135deg, #164e63 0%, #0891b2 50%, #0f172a 100%)',
    description: 'Eastern coastal innovation deck for regional developer forums and IT training workshops.',
  },
  {
    id: 'Southern Innovation Hub',
    name: 'Southern Innovation Hub',
    location: 'Southern Province, Sri Lanka',
    shortName: 'Southern Hub',
    icon: 'fa-water',
    color: '#0284c7',
    bannerGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 50%, #0f172a 100%)',
    description: 'Premier technology and enterprise event space serving the Southern economic and tech corridor.',
  },
  {
    id: 'UOK Innovation Hub',
    name: 'UOK Innovation Hub',
    location: 'Kelaniya, Western Province',
    shortName: 'UOK Hub',
    icon: 'fa-graduation-cap',
    color: '#8b5cf6',
    bannerGradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #0f172a 100%)',
    description: 'University of Kelaniya partnership hub linking university students with industry tech leaders.',
  },
  {
    id: 'UWU Innovation Hub',
    name: 'UWU Innovation Hub',
    location: 'Badulla, Uva Province',
    shortName: 'UWU Hub',
    icon: 'fa-compass',
    color: '#6366f1',
    bannerGradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #0f172a 100%)',
    description: 'Uva Wellassa university innovation deck driving value-addition technology projects in Uva.',
  },
];

export default function VenuesPage({ showToast }) {
  const [venues, setVenues] = useState(() => {
    try {
      const cached = sessionStorage.getItem('eventhub_cached_venues');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem('eventhub_cached_venues');
      const parsed = cached ? JSON.parse(cached) : [];
      return !(Array.isArray(parsed) && parsed.length > 0);
    } catch (e) {
      return true;
    }
  });
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [provinceFilter, setProvinceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [spaceTypeFilter, setSpaceTypeFilter] = useState('All');

  // Derive unique active locations that actually exist in current venues database
  const availableLocations = useMemo(() => {
    const locMap = new Map();
    const knownLocations = [
      'TRACE Expert City Colombo 10',
      'TRACE Coworking Colombo 02',
      'TRACE Coworking Jaffna City',
      'TRACE BREAD Center, Makandura',
      'TRACE Creators Space, Rathnapura',
      'Innovator Park - Kandy',
      'ASAYA Workation By the Sea',
      'UVA Co-Working Space',
    ];

    venues.forEach((v) => {
      const b = (v.branch || '').trim();
      if (!b) return;
      const matched = knownLocations.find(
        (k) => k.toLowerCase() === b.toLowerCase() || b.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(b.toLowerCase())
      );
      if (matched) {
        locMap.set(matched, matched);
      } else {
        locMap.set(b, b);
      }
    });

    return Array.from(locMap.values());
  }, [venues]);

  const currentUser = (() => {
    try {
      const u = localStorage.getItem('eventhub_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();
  const isAdmin = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.role === 'super_admin' ||
    currentUser.role === 'branch_admin' ||
    currentUser.email === 'admin@trace.lk' ||
    currentUser.isAdmin
  );

  // Helper function to derive space type (Meeting Room, Co-working, Auditorium, Event Space)
  const getSpaceType = (v) => {
    if (!v) return 'Meeting Room';
    const rawType = (v.type && typeof v.type === 'string') ? v.type.trim() : '';
    if (rawType) {
      if (rawType.toLowerCase().includes('lab') || rawType.toLowerCase().includes('maker')) return 'Co-Working Space';
      if (rawType.toLowerCase().includes('office') || rawType.toLowerCase().includes('suite')) return 'Meeting Room';
      return rawType;
    }
    const str = `${v.name || ''} ${v.description || ''} ${v.branch || ''} ${v.address || ''}`.toLowerCase();

    if (str.includes('coworking') || str.includes('co-working') || str.includes('incubator') || str.includes('shared desk') || str.includes('coding hub') || str.includes('creators space') || str.includes('lab') || str.includes('maker')) {
      return 'Co-Working Space';
    }
    if (str.includes('auditorium') || str.includes('amphitheater') || str.includes('pavilion') || str.includes('theatre') || str.includes('grand')) {
      return 'Auditorium & Hall';
    }
    if (str.includes('deck') || str.includes('terrace') || str.includes('expo') || str.includes('event space')) {
      return 'Event Space';
    }
    return 'Meeting Room';
  };

  // Helper function to derive province for any space
  const getSpaceProvince = (v) => {
    if (v.province) return v.province;
    const str = `${v.branch || ''} ${v.city || ''} ${v.address || ''} ${v.name || ''}`.toLowerCase();

    if (str.includes('colombo') || str.includes('maradana') || str.includes('western') || str.includes('expert city') || str.includes('hometree') || str.includes('uok') || str.includes('kelaniya')) {
      return 'Western Province';
    }
    if (str.includes('kandy') || str.includes('peradeniya') || str.includes('central') || str.includes('jrdc')) {
      return 'Central Province';
    }
    if (str.includes('jaffna') || str.includes('palaly') || str.includes('northern')) {
      return 'Northern Province';
    }
    if (str.includes('galle') || str.includes('fort') || str.includes('southern') || str.includes('matara') || str.includes('ruhuna') || str.includes('mirissa') || str.includes('kamburugamuwa') || str.includes('asaya')) {
      return 'Southern Province';
    }
    if (str.includes('kurunegala') || str.includes('wayamba') || str.includes('north western') || str.includes('makandura') || str.includes('bread')) {
      return 'North Western Province';
    }
    if (str.includes('rathnapura') || str.includes('creators') || str.includes('sabaragamuwa')) {
      return 'Sabaragamuwa Province';
    }
    if (str.includes('batticaloa') || str.includes('eastern')) {
      return 'Eastern Province';
    }
    if (str.includes('uwu') || str.includes('badulla') || str.includes('uva')) {
      return 'Uva Province';
    }
    return 'Western Province';
  };

  // Helper to format venue pricing (including On Demand without tax labels)
  const getVenuePriceText = (v) => {
    if (!v) return 'On Demand';
    if (v.isOnDemand) return 'On Demand';
    let rp = typeof v.rentalPrice === 'string' ? v.rentalPrice.trim() : '';
    if (rp) {
      if (rp.toLowerCase().includes('demand')) return 'On Demand';
      // Strip any tax suffix: e.g. "+ Tax", "+ Taxes", "+ VAT...", "(Subject to Tax)", etc.
      rp = rp
        .replace(/\s*\+\s*tax(es)?/gi, '')
        .replace(/\s*\+\s*vat(\s*\(\d+%\))?/gi, '')
        .replace(/\s*\+\s*sscl\s*&\s*vat/gi, '')
        .replace(/\s*\(subject to tax\)/gi, '')
        .replace(/\s*\(tax(es)?\)/gi, '')
        .trim();
      return rp || 'On Demand';
    }
    if (v.pricePerHour !== undefined && v.pricePerHour !== null && Number(v.pricePerHour) > 0) {
      return `Rs. ${Number(v.pricePerHour).toLocaleString()} / hr`;
    }
    return 'On Demand';
  };

  const isVenuePriceOnDemand = (v) => {
    return getVenuePriceText(v).toLowerCase().includes('demand');
  };

  // Tax badge specifically for BAY 07 / BOY 07
  const hasTaxBadge = (v) => {
    if (!v) return false;
    const name = String(v.name || '').toLowerCase();
    return name.includes('bay 07') || name.includes('bay 7') || name.includes('boy 07') || name.includes('boy 7');
  };

  // Modal State for Venue Details & Booking Inquiry
  const [activeVenueModal, setActiveVenueModal] = useState(null);
  const [modalActivePhotoIndex, setModalActivePhotoIndex] = useState(0);
  const [modalActiveTab, setModalActiveTab] = useState('details'); // 'details' | 'booking'
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventTitle: '',
    eventDate: '',
    durationHours: '4',
    guests: '50',
    notes: '',
  });
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);

  // Helper to check if a photo URL is valid and not a placeholder stock crowd image
  const isRealVenuePhoto = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed.length === 0) return false;
    // Exclude unintended default crowd/party photos
    if (trimmed.includes('photo-1517457373958-b7bdd4587205') || trimmed.includes('photo-1540575467063-178a50c2df87')) {
      return false;
    }
    return true;
  };

  // Helper to get database uploaded images ONLY for the venue space
  const getModalImages = (venue) => {
    if (!venue) return [];

    // 1. Array of images uploaded to database
    if (Array.isArray(venue.images) && venue.images.length > 0) {
      const validDbImages = venue.images.filter(isRealVenuePhoto);
      if (validDbImages.length > 0) return validDbImages;
    }

    // 2. Single cover image uploaded to database
    if (isRealVenuePhoto(venue.coverImage)) {
      return [venue.coverImage.trim()];
    }

    // 3. No fallback image - return empty list so "No Photo" placeholder is displayed
    return [];
  };

  // Automatic photo rotation every 4.5 seconds for spaces modal
  useEffect(() => {
    if (!activeVenueModal) return;
    const imgs = getModalImages(activeVenueModal);
    if (imgs.length <= 1) return;

    const timer = setInterval(() => {
      setModalActivePhotoIndex((prev) => (prev + 1) % imgs.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeVenueModal]);

  const fetchVenues = async (silent = false) => {
    if (!silent && venues.length === 0) {
      setLoading(true);
    }
    try {
      const res = await fetch('/api/venues');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVenues(data.data);
        try {
          sessionStorage.setItem('eventhub_cached_venues', JSON.stringify(data.data));
        } catch (e) { }
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
      if (showToast && !silent && venues.length === 0) showToast('Failed to load venue listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();

    const handleLiveVenueUpdate = (updatedVenue) => {
      if (!updatedVenue) return;
      const id = String(updatedVenue._id || updatedVenue.id || '');
      if (!id) return;

      if (updatedVenue.deleted) {
        setVenues((prev) => prev.filter((v) => String(v._id || v.id) !== id));
        setActiveVenueModal((prev) => (String(prev?._id || prev?.id) === id ? null : prev));
        try {
          sessionStorage.removeItem('eventhub_cached_venues');
        } catch (e) { }
        fetchVenues(true);
        return;
      }

      setVenues((prev) => {
        const exists = prev.some((v) => String(v._id || v.id) === id);
        if (exists) {
          return prev.map((v) => (String(v._id || v.id) === id ? { ...v, ...updatedVenue } : v));
        }
        return [updatedVenue, ...prev];
      });
      setActiveVenueModal((prev) => (String(prev?._id || prev?.id) === id ? { ...prev, ...updatedVenue } : prev));
      try {
        sessionStorage.removeItem('eventhub_cached_venues');
      } catch (e) { }
      fetchVenues(true);
    };

    const handleCustomVenueEvent = (e) => handleLiveVenueUpdate(e.detail);
    window.addEventListener('eventhub_venues_updated', handleCustomVenueEvent);

    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('eventhub_channel');
        bc.onmessage = (msg) => {
          if (msg.data?.type === 'VENUE_UPDATED') {
            handleLiveVenueUpdate(msg.data.detail);
          }
        };
      } catch (err) { }
    }

    const handleStorage = (e) => {
      if (e.key === 'eventhub_last_venue_update' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.detail) handleLiveVenueUpdate(parsed.detail);
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchVenues(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('eventhub_venues_updated', handleCustomVenueEvent);
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (bc) bc.close();
    };
  }, []);

  // Filter logic
  const filteredVenues = venues.filter((v) => {
    // 0. Province Filter
    if (provinceFilter !== 'All') {
      const p = getSpaceProvince(v);
      if (p.toLowerCase() !== provinceFilter.toLowerCase()) return false;
    }

    // 1. Branch Filter
    if (selectedBranch !== 'All') {
      const vBranch = (v.branch || '').toLowerCase();
      const target = selectedBranch.toLowerCase();
      if (!vBranch.includes(target) && !target.includes(vBranch)) return false;
    }

    // 2. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (v.name || '').toLowerCase();
      const address = (v.address || '').toLowerCase();
      const desc = (v.description || '').toLowerCase();
      const branch = (v.branch || '').toLowerCase();
      const province = getSpaceProvince(v).toLowerCase();
      if (!name.includes(q) && !address.includes(q) && !desc.includes(q) && !branch.includes(q) && !province.includes(q)) {
        return false;
      }
    }

    // 3. Space Type Filter
    if (spaceTypeFilter !== 'All') {
      const type = getSpaceType(v).toLowerCase();
      const target = spaceTypeFilter.toLowerCase();
      if (target === 'meeting room' && !(type.includes('meeting') || type.includes('conference') || type.includes('room'))) return false;
      else if (target === 'co-working' && !(type.includes('co-working') || type.includes('coworking') || type.includes('incubator') || type.includes('desk'))) return false;
      else if (target === 'auditorium' && !(type.includes('auditorium') || type.includes('hall') || type.includes('amphitheater') || type.includes('pavilion'))) return false;
      else if (target === 'event space' && !(type.includes('event') || type.includes('deck') || type.includes('space'))) return false;
      else if (!type.includes(target) && !target.includes(type)) return false;
    }

    // 4. Status Filter
    if (statusFilter !== 'All') {
      if ((v.status || 'Available').toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Calculate statistics across all venues
  const totalVenuesCount = venues.length;
  const availableVenuesCount = venues.filter((v) => v.status === 'Available').length;
  const totalCapacitySum = venues.reduce((acc, v) => acc + (v.capacity || 0), 0);

  // Group venues count by branch
  const getBranchVenueCount = (branchId) => {
    return venues.filter((v) => {
      const b = v.branch || 'TRACE Expert City (Colombo)';
      return b.toLowerCase() === branchId.toLowerCase();
    }).length;
  };

  // Currently active branch metadata
  const activeBranchMeta = TRACE_BRANCHES_META.find(
    (b) => b.id.toLowerCase() === selectedBranch.toLowerCase()
  );

  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const handleSwitchTab = (tabName) => {
    setModalActiveTab(tabName);
    setTimeout(() => {
      const overlayElem = document.querySelector('.modal-overlay');
      if (overlayElem) overlayElem.scrollTop = 0;
      const cardElem = document.querySelector('.venue-split-modal-card');
      if (cardElem) cardElem.scrollTop = 0;
    }, 10);
  };

  const handleOpenInquiryModal = (venue, initialTab = 'details') => {
    setActiveVenueModal(venue);
    setModalActivePhotoIndex(0);
    handleSwitchTab(initialTab);
    setInquiryForm({
      name: '',
      email: '',
      phone: '',
      eventTitle: '',
      eventDate: '',
      durationHours: '4',
      guests: String(venue.capacity ? Math.min(venue.capacity, 50) : 50),
      notes: '',
    });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);

    try {
      const response = await fetch('/api/venue-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: activeVenueModal?._id || activeVenueModal?.id,
          venueName: activeVenueModal?.name,
          branch: activeVenueModal?.branch || 'TRACE Expert City (Colombo)',
          name: inquiryForm.name,
          email: inquiryForm.email,
          phone: inquiryForm.phone,
          eventTitle: inquiryForm.eventTitle,
          eventDate: inquiryForm.eventDate,
          durationHours: Number(inquiryForm.durationHours) || 4,
          guests: Number(inquiryForm.guests) || 50,
          notes: inquiryForm.notes,
          price: getVenuePriceText(activeVenueModal) + (hasTaxBadge(activeVenueModal) ? ' + Tax' : ''),
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setBookingConfirmation(result.data);
        setActiveVenueModal(null);
        if (showToast) showToast(`Booking inquiry submitted! Ref: ${result.data.bookingRef}`, 'success');
      } else {
        if (showToast) showToast(result.message || 'Failed to submit booking inquiry', 'error');
      }
    } catch (err) {
      console.error('Error submitting booking inquiry:', err);
      if (showToast) showToast('Network error while submitting booking inquiry', 'error');
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleClearFilters = () => {
    setProvinceFilter('All');
    setSelectedBranch('All');
    setSpaceTypeFilter('All');
    setStatusFilter('All');
    setSearchQuery('');
  };

  return (
    <div className="upcoming-events-page spaces-page">
      {/* Main Content Area */}
      <div className="section-container">
        {/* Page Title & Subtitle Header */}
        <div className="page-header">
          <h1 className="page-title">Spaces & Facilities</h1>
          <p className="page-subtitle">
            Explore world-class auditoriums, technology labs, and facilities stationed across TRACE locations.
          </p>
        </div>

        {/* Single Horizontal Tab Spaces Filter Bar */}
        <div className="filter-bar-container">
          {/* 1. Search Field */}
          <div className="filter-item">
            <label htmlFor="spaces-filter-search">Search Spaces</label>
            <div className="search-input-wrapper">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                id="spaces-filter-search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Province Selector */}
          <div className="filter-item">
            <label htmlFor="spaces-filter-province">Province</label>
            <div className="select-wrapper">
              <select
                id="spaces-filter-province"
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
              >
                <option value="All">All Sri Lanka</option>
                <option value="Western Province">Western Province</option>
                <option value="Central Province">Central Province</option>
                <option value="Northern Province">Northern Province</option>
                <option value="Southern Province">Southern Province</option>
                <option value="North Western Province">North Western Province</option>
                <option value="Eastern Province">Eastern Province</option>
                <option value="Sabaragamuwa Province">Sabaragamuwa Province</option>
                <option value="Uva Province">Uva Province</option>
                <option value="North Central Province">North Central Province</option>
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>

          {/* 3. Location Selector */}
          <div className="filter-item">
            <label htmlFor="spaces-filter-location">Location</label>
            <div className="select-wrapper">
              <select
                id="spaces-filter-location"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="All">All Locations</option>
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>

          {/* 4. Space Type Selector */}
          <div className="filter-item">
            <label htmlFor="spaces-filter-type">Space Type</label>
            <div className="select-wrapper">
              <select
                id="spaces-filter-type"
                value={spaceTypeFilter}
                onChange={(e) => setSpaceTypeFilter(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Meeting Room">Meeting Room</option>
                <option value="Co-Working">Co-Working Space</option>
                <option value="Auditorium">Auditorium & Conference Hall</option>
                <option value="Event Space">Event Space</option>
              </select>
              <i className="fa-solid fa-chevron-down select-arrow"></i>
            </div>
          </div>

          {/* 5. Filter Button & Clear Button */}
          <div className="filter-actions">
            <button
              type="button"
              className="btn-filter-submit"
              onClick={() => { }}
            >
              Filter
            </button>
            <button
              type="button"
              className="btn-filter-clear"
              onClick={handleClearFilters}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="venues-loading-state">
            <div className="spinner"></div>
            <p>Loading TRACE venue spaces...</p>
          </div>
        )}

        {/* Empty Filter State */}
        {!loading && filteredVenues.length === 0 && (
          <div className="venues-empty-card">
            <div className="empty-icon-circle">
              <i className="fa-solid fa-building-circle-xmark"></i>
            </div>
            <h3>No venue places match your criteria</h3>
            <p>Try clearing your search query, switching branches, or resetting your filter choices.</p>
            <button
              className="btn btn-outline"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                setSelectedBranch('All');
                setProvinceFilter('All');
                setSearchQuery('');
                setStatusFilter('All');
                setSpaceTypeFilter('All');
              }}
            >
              <i className="fa-solid fa-filter-circle-xmark"></i> Reset All Filters
            </button>
          </div>
        )}

        {/* 5. Venues / Places Grid */}
        {!loading && filteredVenues.length > 0 && (
          <div className="venues-modern-grid">
            {filteredVenues.map((v) => {
              const venueBranchName = v.branch || 'TRACE Expert City (Colombo)';
              const branchMeta = TRACE_BRANCHES_META.find(
                (b) => b.id.toLowerCase() === venueBranchName.toLowerCase()
              );

              return (
                <div
                  key={v._id || v.id}
                  className="venue-card-redesign"
                  onClick={() => handleOpenInquiryModal(v, 'details')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenInquiryModal(v, 'details');
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Card Banner Image */}
                  <div className="venue-banner-wrapper">
                    {isRealVenuePhoto(v.coverImage) ? (
                      <img
                        src={optimizeImageUrl(v.coverImage.trim(), 800)}
                        alt={v.name}
                        className="venue-card-image"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.venue-card-no-image');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="venue-card-no-image"
                      style={{ display: isRealVenuePhoto(v.coverImage) ? 'none' : 'flex' }}
                    >
                      <i className="fa-regular fa-image no-image-icon"></i>
                      <span className="no-image-text">No Photo</span>
                    </div>
                    <div className="venue-card-overlay-badges">
                      {/* Availability Tag */}
                      <span
                        className={`venue-status-pill ${v.status === 'Available'
                          ? 'status-available'
                          : v.status === 'Reserved'
                            ? 'status-reserved'
                            : 'status-maintenance'
                          }`}
                      >
                        <i className="fa-solid fa-circle" style={{ fontSize: '0.55rem' }}></i>{' '}
                        {v.status || 'Available'}
                      </span>

                      {/* Capacity Pill */}
                      <span className="venue-capacity-pill">
                        <i className="fa-solid fa-users"></i>{' '}
                        {typeof v.capacity === 'number' && v.capacity > 0
                          ? `${v.capacity} Seats`
                          : !isNaN(Number(v.capacity)) && Number(v.capacity) > 0
                            ? `${Number(v.capacity)} Seats`
                            : (v.capacity && String(v.capacity).trim() !== '' && v.capacity !== 0 && v.capacity !== '0'
                              ? v.capacity
                              : 'Custom Setup')}
                      </span>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="venue-card-content">
                    {/* Branch Label & Rental Price Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div className="venue-branch-tag" style={{ margin: 0 }}>
                          <i className={`fa-solid ${branchMeta?.icon || 'fa-building'}`}></i>
                          <span>{branchMeta?.shortName || venueBranchName}</span>
                        </div>
                        <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#0284c7', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 7px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <i className="fa-solid fa-shapes"></i> {getSpaceType(v)}
                        </span>
                        <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#5d4df6', background: '#eff6ff', border: '1px solid #dbeafe', padding: '2px 7px', borderRadius: '6px' }}>
                          📍 {getSpaceProvince(v)}
                        </span>
                      </div>
                      <span
                        className="venue-card-price-tag"
                        style={isVenuePriceOnDemand(v) ? { color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0', fontWeight: '800' } : {}}
                      >
                        <i className="fa-solid fa-tag"></i> {getVenuePriceText(v)}
                        {hasTaxBadge(v) && <span className="venue-tax-badge">+ Tax</span>}
                      </span>
                    </div>

                    <h3 className="venue-card-title">{v.name}</h3>

                    <p className="venue-card-address">
                      <i className="fa-solid fa-location-dot"></i> {v.address}
                    </p>

                    {v.description && (
                      <FormattedText content={v.description} className="venue-card-description" />
                    )}

                    {/* Amenities Chips */}
                    {v.amenities && v.amenities.length > 0 && (
                      <div className="venue-amenities-row">
                        {v.amenities.slice(0, 4).map((am, i) => (
                          <span key={i} className="amenity-chip-tag">
                            ✓ {am}
                          </span>
                        ))}
                        {v.amenities.length > 4 && (
                          <span className="amenity-chip-more">
                            +{v.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="venue-card-actions" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-venue-inquire"
                        style={{ flex: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInquiryModal(v, 'details');
                        }}
                      >
                        <i className="fa-solid fa-eye"></i> View Details
                      </button>
                      <button
                        type="button"
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #5d4df6 0%, #4f46e5 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          padding: '0.55rem 0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(93, 77, 246, 0.25)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInquiryModal(v, 'booking');
                        }}
                      >
                        <i className="fa-solid fa-paper-plane"></i> Inquire Space
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Modern Unified Space Showcase & Reservation Modal */}
      {activeVenueModal && (
        <div
          className="modal-overlay"
          onClick={() => setActiveVenueModal(null)}
        >
          <div
            className="modal-card venue-split-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative' }}
          >
            {/* Floating Close Button */}
            <button
              className="modal-close"
              onClick={() => setActiveVenueModal(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '16px',
                background: 'rgba(241, 245, 249, 0.95)',
                backdropFilter: 'blur(4px)',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                fontSize: '1.1rem',
                transition: 'all 0.2s ease',
                zIndex: 25,
              }}
              title="Close modal"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            {/* Modal Navigation Tabs (Overview & Booking Inquiry) */}
            <div
              className="venue-modal-header-bar"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 1.5rem',
                borderBottom: '1px solid #e2e8f0',
                background: '#ffffff',
                flexWrap: 'wrap',
                gap: '0.75rem',
                paddingRight: '4.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className={`venue-modal-tab-btn ${modalActiveTab === 'details' ? 'active' : ''}`}
                  onClick={() => handleSwitchTab('details')}
                  style={{
                    padding: '0.45rem 1.15rem',
                    borderRadius: '20px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    background: modalActiveTab === 'details' ? '#5d4df6' : '#f1f5f9',
                    color: modalActiveTab === 'details' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className="fa-solid fa-circle-info"></i> Space Overview
                </button>
                <button
                  type="button"
                  className={`venue-modal-tab-btn ${modalActiveTab === 'booking' ? 'active' : ''}`}
                  onClick={() => handleSwitchTab('booking')}
                  style={{
                    padding: '0.45rem 1.15rem',
                    borderRadius: '20px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    background: modalActiveTab === 'booking' ? '#5d4df6' : '#f1f5f9',
                    color: modalActiveTab === 'booking' ? '#ffffff' : '#64748b',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <i className="fa-solid fa-paper-plane"></i> Inquire Space
                </button>
              </div>
            </div>

            {/* TAB CONTENT: EITHER BOOKING INQUIRY OR DETAILS OVERVIEW */}
            {modalActiveTab === 'booking' ? (
              <div className="venue-booking-split-grid" style={{ minHeight: '560px', maxHeight: 'calc(90vh - 65px)', overflowY: 'auto' }}>
                {/* Left Side: Space Snapshot */}
                <div className="venue-booking-sidebar" style={{ padding: '1.75rem', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeVenueModal.coverImage && isRealVenuePhoto(activeVenueModal.coverImage) ? (
                    <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}>
                      <img
                        src={optimizeImageUrl(activeVenueModal.coverImage, 600)}
                        alt={activeVenueModal.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ) : null}

                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#5d4df6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Selected Facility
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px 0' }}>
                      {activeVenueModal.name}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="fa-solid fa-location-dot"></i> {activeVenueModal.branch || activeVenueModal.address}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Rate / Pricing:</span>
                      <strong style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {getVenuePriceText(activeVenueModal)}
                        {hasTaxBadge(activeVenueModal) && <span className="venue-tax-badge">+ Tax</span>}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Capacity:</span>
                      <strong style={{ color: '#0f172a' }}>
                        {typeof activeVenueModal.capacity === 'number' && activeVenueModal.capacity > 0
                          ? `${activeVenueModal.capacity} Guests`
                          : (activeVenueModal.capacity || 'Custom Setup')}
                      </strong>
                    </div>
                  </div>

                  {/* Trust / Notification Box */}
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem 1rem', marginTop: 'auto' }}>
                    <div style={{ fontSize: '0.78rem', color: '#1e40af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <i className="fa-solid fa-shield-halved"></i> Direct TRACE Inquiry
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#3b82f6', margin: 0, lineHeight: 1.45 }}>
                      Inquiry requests are dispatched in real-time to <strong>connect@trace.lk</strong>. Our facilities coordinator will contact you promptly.
                    </p>
                  </div>
                </div>

                {/* Right Side: Inquiry Form */}
                <div className="venue-booking-form-content" style={{ padding: '2rem 2.25rem', overflowY: 'auto', background: '#ffffff' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                      Inquire Space
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0 }}>
                      Fill in your event details below to submit an inquiry.
                    </p>
                  </div>

                  <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="venue-form-row-2col">
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="venue-inquiry-input"
                          placeholder="e.g. Kasun Perera"
                          value={inquiryForm.name}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          className="venue-inquiry-input"
                          placeholder="e.g. kasun@example.com"
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="venue-form-row-2col">
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          className="venue-inquiry-input"
                          placeholder="e.g. +94 77 123 4567"
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Target Event Date *
                        </label>
                        <input
                          type="date"
                          required
                          className="venue-inquiry-input"
                          value={inquiryForm.eventDate}
                          min={new Date().toISOString().slice(0, 10)}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, eventDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                        Event Title / Purpose *
                      </label>
                      <input
                        type="text"
                        required
                        className="venue-inquiry-input"
                        placeholder="e.g. Tech Founders Meetup / Product Launch 2026"
                        value={inquiryForm.eventTitle}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, eventTitle: e.target.value })}
                      />
                    </div>

                    <div className="venue-form-row-2col">
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Duration (Hours)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="72"
                          className="venue-inquiry-input"
                          placeholder="4"
                          value={inquiryForm.durationHours}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, durationHours: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                          Expected Attendees
                        </label>
                        <input
                          type="number"
                          min="1"
                          className="venue-inquiry-input"
                          placeholder="50"
                          value={inquiryForm.guests}
                          onChange={(e) => setInquiryForm({ ...inquiryForm, guests: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem', display: 'block' }}>
                        Special Requirements or Notes (Optional)
                      </label>
                      <textarea
                        className="venue-inquiry-input"
                        rows="3"
                        placeholder="e.g. Need podium microphone, stage lighting, coffee break space, 4K projector..."
                        value={inquiryForm.notes}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('details')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          padding: '0.6rem 1rem',
                        }}
                      >
                        Back to Details
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                          background: 'linear-gradient(135deg, #5d4df6 0%, #4f46e5 100%)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          padding: '0.75rem 1.6rem',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(93, 77, 246, 0.3)',
                        }}
                        disabled={isSubmittingInquiry}
                      >
                        {isSubmittingInquiry ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Submitting to connect@trace.lk...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-paper-plane"></i> Send Inquiry
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              /* DETAILS VIEW */
              <div className="venue-split-grid">

                {/* LEFT SIDE: DATABASE UPLOADED PHOTO GALLERY SHOWCASE */}
                <div className="venue-split-left-gallery">
                  {(() => {
                    const modalImages = getModalImages(activeVenueModal);
                    const currentImg = modalImages[modalActivePhotoIndex] || modalImages[0];

                    if (!currentImg || !isRealVenuePhoto(currentImg)) {
                      return (
                        <div className="venue-modal-no-image-box">
                          <i className="fa-regular fa-image no-image-icon-large"></i>
                          <span className="no-image-title">No Photo Available</span>
                          <span className="no-image-subtitle">No facility photos have been uploaded for this space.</span>
                        </div>
                      );
                    }

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: '100%', flex: 1 }}>
                        {/* Main Active Photo View */}
                        <div className="modal-active-photo-box" style={{ position: 'relative', overflow: 'hidden', width: '100%', flex: 1, minHeight: '360px', borderRadius: '16px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                          <img
                            key={modalActivePhotoIndex}
                            src={optimizeImageUrl(currentImg, 1200)}
                            alt={`${activeVenueModal.name} view ${modalActivePhotoIndex + 1}`}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                <div class="venue-modal-no-image-box" style="min-height: 480px; width: 100%; border: none;">
                                  <i class="fa-regular fa-image no-image-icon-large"></i>
                                  <span class="no-image-title">No Photo Available</span>
                                  <span class="no-image-subtitle">Photo could not be loaded.</span>
                                </div>
                              `;
                              }
                            }}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'opacity 0.3s ease',
                            }}
                          />

                          {/* Navigation Arrows (Only shown if multiple DB images exist) */}
                          {modalImages.length > 1 && (
                            <>
                              {/* Left Arrow */}
                              <button
                                type="button"
                                onClick={() =>
                                  setModalActivePhotoIndex((prev) =>
                                    prev === 0 ? modalImages.length - 1 : prev - 1
                                  )
                                }
                                style={{
                                  position: 'absolute',
                                  left: '12px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(15, 23, 42, 0.75)',
                                  backdropFilter: 'blur(4px)',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255, 255, 255, 0.25)',
                                  borderRadius: '50%',
                                  width: '36px',
                                  height: '36px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem',
                                  zIndex: 5,
                                }}
                                title="Previous Photo"
                              >
                                <i className="fa-solid fa-chevron-left"></i>
                              </button>

                              {/* Right Arrow */}
                              <button
                                type="button"
                                onClick={() =>
                                  setModalActivePhotoIndex((prev) =>
                                    prev === modalImages.length - 1 ? 0 : prev + 1
                                  )
                                }
                                style={{
                                  position: 'absolute',
                                  right: '12px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(15, 23, 42, 0.75)',
                                  backdropFilter: 'blur(4px)',
                                  color: '#ffffff',
                                  border: '1px solid rgba(255, 255, 255, 0.25)',
                                  borderRadius: '50%',
                                  width: '36px',
                                  height: '36px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem',
                                  zIndex: 5,
                                }}
                                title="Next Photo"
                              >
                                <i className="fa-solid fa-chevron-right"></i>
                              </button>

                              {/* Counter Badge */}
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '12px',
                                  right: '12px',
                                  background: 'rgba(15, 23, 42, 0.85)',
                                  backdropFilter: 'blur(6px)',
                                  color: '#ffffff',
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  border: '1px solid rgba(255, 255, 255, 0.2)',
                                  zIndex: 5,
                                }}
                              >
                                📷 {modalActivePhotoIndex + 1} / {modalImages.length}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Clickable Photo Thumbnails Row (Only rendered if multiple DB images exist) */}
                        {modalImages.length > 1 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflowX: 'auto', paddingBottom: '4px' }}>
                            {modalImages.map((imgUrl, idx) => (
                              <div
                                key={idx}
                                onClick={() => setModalActivePhotoIndex(idx)}
                                style={{
                                  width: '74px',
                                  height: '52px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  border: modalActivePhotoIndex === idx ? '2.5px solid #5d4df6' : '1px solid #cbd5e1',
                                  opacity: modalActivePhotoIndex === idx ? 1 : 0.65,
                                  transition: 'all 0.2s ease',
                                  flexShrink: 0,
                                  background: '#0f172a',
                                }}
                              >
                                <img
                                  src={optimizeImageUrl(imgUrl, 200)}
                                  alt={`Thumbnail ${idx + 1}`}
                                  loading="lazy"
                                  decoding="async"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* RIGHT SIDE: VENUE NAME, SPECIFICATIONS & DETAILS DISPLAY */}
                <div className="venue-split-right-details">

                  {/* 1. SPACE NAME & TOP BADGES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                      {activeVenueModal.name}
                    </h2>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#eef2ff', color: '#5d4df6', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.76rem', border: '1px solid #c7d2fe', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fa-solid fa-building"></i> {activeVenueModal.branch || 'TRACE Expert City'}
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: activeVenueModal.status === 'Available' ? '#059669' : '#d97706', background: activeVenueModal.status === 'Available' ? '#dcfce7' : '#fef3c7', padding: '0.25rem 0.65rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        ● {activeVenueModal.status || 'Available'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          color: '#059669',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <i className="fa-solid fa-tag"></i> {getVenuePriceText(activeVenueModal)}
                        {hasTaxBadge(activeVenueModal) && <span className="venue-tax-badge">+ Tax</span>}
                      </span>
                    </div>

                    {/* Province, Type, Capacity & Location Address */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0369a1', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '0.25rem 0.65rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <i className="fa-solid fa-shapes"></i> {getSpaceType(activeVenueModal)}
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#5d4df6', background: '#eff6ff', border: '1px solid #dbeafe', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
                        📍 {getSpaceProvince(activeVenueModal)}
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#0052cc', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '0.25rem 0.65rem', borderRadius: '20px' }}>
                        👥 Capacity:{' '}
                        {typeof activeVenueModal.capacity === 'number' && activeVenueModal.capacity > 0
                          ? `${activeVenueModal.capacity} Guests`
                          : !isNaN(Number(activeVenueModal.capacity)) && Number(activeVenueModal.capacity) > 0
                            ? `${Number(activeVenueModal.capacity)} Guests`
                            : (activeVenueModal.capacity && String(activeVenueModal.capacity).trim() !== '' && activeVenueModal.capacity !== 0 && activeVenueModal.capacity !== '0'
                              ? activeVenueModal.capacity
                              : 'Custom Setup')}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>
                        <i className="fa-solid fa-location-dot" style={{ color: '#64748b', marginRight: '4px' }}></i>
                        {activeVenueModal.address}
                      </span>
                    </div>
                  </div>

                  {/* 2. SPACE OVERVIEW DESCRIPTION */}
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="fa-solid fa-circle-info" style={{ color: '#0052cc' }}></i> Space Overview
                    </h4>
                    {activeVenueModal.description ? (
                      <div style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55 }}>
                        <FormattedText content={activeVenueModal.description} className="space-modal-description-text" />
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                        Enterprise auditorium & event venue equipped with modern AV, air conditioning, stage lighting, and high-speed fiber internet.
                      </p>
                    )}
                  </div>

                  {/* 3. INCLUDED FACILITIES & AMENITIES */}
                  {activeVenueModal.amenities && activeVenueModal.amenities.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fa-solid fa-sliders" style={{ color: '#0052cc' }}></i> Included Facilities
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                        {activeVenueModal.amenities.map((am, i) => (
                          <span key={i} style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e293b', background: '#f1f5f9', padding: '5px 11px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fa-solid fa-check" style={{ color: '#10b981', fontSize: '0.75rem' }}></i> {am}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. BOOKING INQUIRY ACTION BUTTON */}
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSwitchTab('booking')}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.92rem',
                        background: 'linear-gradient(135deg, #5d4df6 0%, #4f46e5 100%)',
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(93, 77, 246, 0.35)',
                        border: 'none',
                      }}
                    >
                      <i className="fa-solid fa-paper-plane"></i> Inquire Space
                    </button>
                  </div>

                  {/* Extra bottom padding to ensure the last item is never cut off */}
                  <div style={{ height: '2.5rem', flexShrink: 0 }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Confirmation Receipt Modal */}
      {bookingConfirmation && (
        <div className="modal-overlay" onClick={() => setBookingConfirmation(null)}>
          <div className="modal-card" style={{ maxWidth: '580px', borderRadius: '20px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setBookingConfirmation(null)}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                Space Inquiry Submitted!
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                Your space inquiry has been dispatched to <strong>connect@trace.lk</strong> and a confirmation copy was sent to your email.
              </p>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px dashed #cbd5e1', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '700' }}>INQUIRY REFERENCE</span>
                <span style={{ fontSize: '1rem', fontWeight: '800', color: '#5d4df6', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                  {bookingConfirmation.bookingRef}
                </span>
              </div>

              <div className="venue-receipt-grid">
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>VENUE SPACE</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.venueName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>LOCATION / BRANCH</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.branch}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>EVENT TITLE</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.eventTitle}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>TARGET DATE & DURATION</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.eventDate} ({bookingConfirmation.durationHours || 4} Hours)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>APPLICANT</span>
                  <strong style={{ color: '#0f172a' }}>{bookingConfirmation.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', display: 'block', fontWeight: '600' }}>STATUS</span>
                  <span style={{ color: '#d97706', fontWeight: '700', background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', display: 'inline-block' }}>
                    ● {bookingConfirmation.status || 'Pending Review'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px' }}
                onClick={() => setBookingConfirmation(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
