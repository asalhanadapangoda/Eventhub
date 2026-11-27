import React, { useState, useEffect, useMemo } from 'react';
import FormattedText from './FormattedText';
import ImageCarouselSlider from './ImageCarouselSlider';
import { optimizeImageUrl, getSpaceTypes, getSpaceType, getSpaceTypeIcon, AVAILABLE_SPACE_TYPES, getSpaceProvince, isWesternSpace } from '../utils/eventUtils';
import { cachedFetchJson } from '../../../common/apiCache';

const VenueDetailBookingModal = React.lazy(() => import('./modals/VenueDetailBookingModal'));

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

  // Single unified list containing all locations and all existing/newly added spaces (no duplicates)
  const availableLocations = useMemo(() => {
    const locMap = new Map();

    // 1. Add all branches/locations
    venues.forEach((v) => {
      const b = (v.branch || '').trim();
      if (b && !locMap.has(b.toLowerCase())) {
        locMap.set(b.toLowerCase(), b);
      }
    });

    // 2. Add all individual space names (if not already in list)
    venues.forEach((v) => {
      const name = (v.name || '').trim();
      if (name && !locMap.has(name.toLowerCase())) {
        locMap.set(name.toLowerCase(), name);
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

  // Helper to get structured pricing details (including tax information)
  const getVenuePriceDetails = (v) => {
    if (!v) return { fullText: 'On Demand', baseText: 'On Demand', taxText: '', hasTax: false, isDemand: true };

    const rawRp = typeof v.rentalPrice === 'string' ? v.rentalPrice.trim() : '';
    const hasTaxInString = rawRp.toLowerCase().includes('tax') || rawRp.toLowerCase().includes('vat') || rawRp.toLowerCase().includes('sscl');
    const hasTax = Boolean(v.includeTax) || hasTaxInString;

    // Detect tax label if present
    let taxLabel = v.taxLabelType;
    if (!taxLabel && hasTaxInString) {
      const match = rawRp.match(/(\+\s*(?:Tax(?:es)?|VAT(?:\s*\(\d+%\))?|SSCL\s*&\s*VAT)|\(Subject to Tax\))/i);
      if (match) taxLabel = match[0].trim();
    }
    if (!taxLabel && hasTax) {
      taxLabel = '+ Tax';
    }

    const isDemand = Boolean(v.isOnDemand || rawRp.toLowerCase().includes('demand'));
    if (isDemand) {
      const cleanTaxLabel = (taxLabel || 'Tax').replace(/^\+?\s*/, '').replace(/^\(|\)$/g, '');
      const fullText = hasTax ? `On Demand (${cleanTaxLabel})` : 'On Demand';
      return {
        fullText,
        baseText: 'On Demand',
        taxText: hasTax ? (taxLabel || '+ Tax') : '',
        hasTax,
        isDemand: true,
      };
    }

    // Clean base price without tax suffix
    let basePrice = rawRp
      .replace(/\s*\+\s*tax(es)?/gi, '')
      .replace(/\s*\+\s*vat(\s*\(\d+%\))?/gi, '')
      .replace(/\s*\+\s*sscl\s*&\s*vat/gi, '')
      .replace(/\s*\(subject to tax\)/gi, '')
      .replace(/\s*\(tax(es)?\)/gi, '')
      .trim();

    if (!basePrice && v.pricePerHour !== undefined && v.pricePerHour !== null && Number(v.pricePerHour) > 0) {
      basePrice = `Rs. ${Number(v.pricePerHour).toLocaleString()} / hr`;
    }

    if (!basePrice) {
      basePrice = 'On Demand';
    }

    const fullText = hasTax ? `${basePrice} ${taxLabel}` : basePrice;

    return {
      fullText,
      baseText: basePrice,
      taxText: hasTax ? taxLabel : '',
      hasTax,
      isDemand: basePrice.toLowerCase().includes('demand'),
    };
  };

  // Helper to format venue pricing (including tax labels)
  const getVenuePriceText = (v) => {
    return getVenuePriceDetails(v).fullText;
  };

  const isVenuePriceOnDemand = (v) => {
    return getVenuePriceDetails(v).isDemand;
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

  const fetchVenues = async (silent = false, bustCache = false) => {
    if (!silent && venues.length === 0) {
      setLoading(true);
    }
    try {
      const data = await cachedFetchJson('/api/venues', { ttlMs: 60000, bustCache });
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

  // Filter and sort logic (Western Province spaces display first)
  const filteredVenues = useMemo(() => {
    return venues
      .filter((v) => {
        // 0. Province Filter
        if (provinceFilter !== 'All') {
          const p = getSpaceProvince(v);
          if (p.toLowerCase() !== provinceFilter.toLowerCase()) return false;
        }

        // 1. Location & Space Filter
        if (selectedBranch !== 'All') {
          const target = selectedBranch.toLowerCase().trim();
          const vBranch = (v.branch || '').toLowerCase().trim();
          const vName = (v.name || '').toLowerCase().trim();

          const matchesBranch = vBranch === target || vBranch.includes(target) || target.includes(vBranch);
          const matchesName = vName === target || vName.includes(target) || target.includes(vName);

          if (!matchesBranch && !matchesName) return false;
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
          const types = getSpaceTypes(v).map((t) => t.toLowerCase());
          const target = spaceTypeFilter.toLowerCase();

          const matches = types.some((t) => {
            if (target.includes('meeting') && t.includes('meeting')) return true;
            if (target.includes('conference') && (t.includes('conference') || t.includes('hall'))) return true;
            if ((target.includes('co-working') || target.includes('coworking')) && (t.includes('co-working') || t.includes('coworking'))) return true;
            if (target.includes('maker') && t.includes('maker')) return true;
            if (target.includes('workshop') && t.includes('workshop')) return true;
            if (target.includes('workation') && t.includes('workation')) return true;
            if (target.includes('event') && t.includes('event')) return true;
            if ((target.includes('coffee') || target.includes('coffe') || target.includes('cafe')) && (t.includes('coffee') || t.includes('coffe') || t.includes('cafe'))) return true;
            return t === target || t.includes(target) || target.includes(t);
          });

          if (!matches) return false;
        }

        // 4. Status Filter
        if (statusFilter !== 'All') {
          if ((v.status || 'Available').toLowerCase() !== statusFilter.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const isAWest = isWesternSpace(a);
        const isBWest = isWesternSpace(b);
        if (isAWest && !isBWest) return -1;
        if (!isAWest && isBWest) return 1;
        return 0;
      });
  }, [venues, provinceFilter, selectedBranch, searchQuery, spaceTypeFilter, statusFilter]);

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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test((inquiryForm.email || '').trim())) {
      if (showToast) showToast('Please enter a valid email address (e.g. name@example.com)', 'error');
      return;
    }

    const cleanPhone = (inquiryForm.phone || '').trim().replace(/[\s\-()]/g, '');
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(cleanPhone)) {
      if (showToast) showToast('Please enter a valid phone number (at least 9 digits, e.g. 0771234567 or +94771234567)', 'error');
      return;
    }

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
          price: getVenuePriceText(activeVenueModal),
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
                {AVAILABLE_SPACE_TYPES.map((typeOpt) => (
                  <option key={typeOpt} value={typeOpt}>
                    {typeOpt}
                  </option>
                ))}
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
                        {getSpaceTypes(v).map((st) => (
                          <span
                            key={st}
                            style={{
                              fontSize: '0.74rem',
                              fontWeight: '700',
                              color: '#0284c7',
                              background: '#f0f9ff',
                              border: '1px solid #bae6fd',
                              padding: '2px 7px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <i className={`fa-solid ${getSpaceTypeIcon(st)}`}></i> {st}
                          </span>
                        ))}
                        <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#5d4df6', background: '#eff6ff', border: '1px solid #dbeafe', padding: '2px 7px', borderRadius: '6px' }}>
                          📍 {getSpaceProvince(v)}
                        </span>
                      </div>
                      {(() => {
                        const priceInfo = getVenuePriceDetails(v);
                        return (
                          <span
                            className="venue-card-price-tag"
                            style={priceInfo.isDemand ? { color: '#059669', background: '#ecfdf5', borderColor: '#a7f3d0', fontWeight: '800' } : {}}
                            title={priceInfo.fullText}
                          >
                            <i className="fa-solid fa-tag"></i> {priceInfo.baseText}
                            {priceInfo.taxText && (
                              <span
                                className="venue-card-tax-pill"
                                style={{
                                  marginLeft: '4px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  color: '#4f46e5',
                                  background: '#eef2ff',
                                  border: '1px solid #c7d2fe',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  letterSpacing: '0.02em',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                {priceInfo.taxText}
                              </span>
                            )}
                          </span>
                        );
                      })()}
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

      {/* 6. Lazy-loaded Space Showcase & Reservation Modal */}
      {(activeVenueModal || bookingConfirmation) && (
        <React.Suspense fallback={null}>
          <VenueDetailBookingModal
            activeVenueModal={activeVenueModal}
            setActiveVenueModal={setActiveVenueModal}
            modalActiveTab={modalActiveTab}
            handleSwitchTab={handleSwitchTab}
            modalActivePhotoIndex={modalActivePhotoIndex}
            setModalActivePhotoIndex={setModalActivePhotoIndex}
            inquiryForm={inquiryForm}
            setInquiryForm={setInquiryForm}
            handleInquirySubmit={handleInquirySubmit}
            isSubmittingInquiry={isSubmittingInquiry}
            bookingConfirmation={bookingConfirmation}
            setBookingConfirmation={setBookingConfirmation}
            getVenuePriceDetails={getVenuePriceDetails}
            isRealVenuePhoto={isRealVenuePhoto}
            getModalImages={getModalImages}
          />
        </React.Suspense>
      )}

    </div>
  );
}
