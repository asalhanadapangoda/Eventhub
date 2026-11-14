/**
 * Calculates the exact end DateTime of an event based on its date and time string.
 * @param {Date|string} dateVal - Event date (e.g. '2026-08-25' or ISO string)
 * @param {string} timeStr - Event time string (e.g. '09:00 AM - 11:30 AM', '14:00', '2:30 PM')
 * @returns {Date} - Exact End Date & Time
 */
export function getEventEndDateTime(dateVal, timeStr) {
  if (!dateVal) return new Date();

  let year, month, day;

  if (typeof dateVal === 'string') {
    const cleanDateStr = dateVal.includes('T') ? dateVal.split('T')[0] : dateVal;
    const parts = cleanDateStr.split('-');
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    }
  }

  if (year === undefined || isNaN(year)) {
    const d = new Date(dateVal);
    year = d.getFullYear();
    month = d.getMonth();
    day = d.getDate();
  }

  let hours = 23;
  let minutes = 59;
  let seconds = 59;

  if (timeStr && typeof timeStr === 'string' && timeStr.trim().length > 0) {
    let targetTime = timeStr.trim();
    const hasRange = targetTime.includes('-') || targetTime.toLowerCase().includes(' to ');

    if (targetTime.includes('-')) {
      const splitTime = targetTime.split('-');
      targetTime = splitTime[1].trim();
    } else if (targetTime.toLowerCase().includes(' to ')) {
      const splitTime = targetTime.toLowerCase().split(' to ');
      targetTime = splitTime[1].trim();
    }

    const timeMatch = targetTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      let m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;

      // If single start time provided (no range), default duration is 2 hours
      if (!hasRange) {
        h += 2;
      }

      hours = h;
      minutes = m;
      seconds = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, seconds);
}

/**
 * Checks if an event is in the past (i.e. its set date and time have finished).
 * @param {Object} event - Event object with date, time, status
 * @returns {boolean} - True if event date & time are finished
 */
export function isEventPast(event) {
  if (!event) return false;
  if (event.status === 'past') return true;
  if (event.status === 'draft') return false;
  if (!event.date) return false;

  const endDateTime = getEventEndDateTime(event.date, event.time);
  return new Date() > endDateTime;
}

/**
 * Strips HTML tags and decodes entities to return clean plain text for previews.
 * @param {string} html - HTML string or plain text
 * @returns {string} - Clean plain text
 */
export function stripHtml(html) {
  if (!html) return '';
  const str = String(html);
  if (!/<[a-z][\s\S]*>/i.test(str)) {
    return str;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    return (doc.body.textContent || doc.body.innerText || '').replace(/\s+/g, ' ').trim();
  } catch (e) {
    return str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/**
 * Broadcasts an event change (update, create, delete) across components and tabs immediately.
 * @param {Object} detail - The updated/created event or { _id, deleted: true }
 */
export function notifyEventUpdated(detail) {
  if (!detail) return;
  try {
    // 1. In-tab custom event
    window.dispatchEvent(new CustomEvent('eventhub_events_updated', { detail }));

    // 2. Cross-tab BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('eventhub_channel');
      bc.postMessage({ type: 'EVENT_UPDATED', detail });
      bc.close();
    }

    // 3. Cross-tab localStorage trigger
    localStorage.setItem(
      'eventhub_last_event_update',
      JSON.stringify({ detail, timestamp: Date.now() })
    );
  } catch (err) {
    console.error('Error dispatching event update broadcast:', err);
  }
}

/**
 * Broadcasts a venue change (update, create, delete) across components and tabs immediately.
 * @param {Object} detail - The updated/created venue or { _id, deleted: true }
 */
export function notifyVenueUpdated(detail) {
  if (!detail) return;
  try {
    sessionStorage.removeItem('eventhub_cached_venues');
    window.dispatchEvent(new CustomEvent('eventhub_venues_updated', { detail }));
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('eventhub_channel');
      bc.postMessage({ type: 'VENUE_UPDATED', detail });
      bc.close();
    }
    localStorage.setItem(
      'eventhub_last_venue_update',
      JSON.stringify({ detail, timestamp: Date.now() })
    );
  } catch (err) {
    console.error('Error dispatching venue update broadcast:', err);
  }
}

export const DEFAULT_EVENT_BANNER =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=75';

/**
 * Optimizes image URLs for fast web delivery (Cloudinary WebP/AVIF auto-format and Unsplash width/quality).
 * @param {string} url - Original image URL
 * @param {number} width - Maximum display width
 * @returns {string} - Optimized URL
 */
export function optimizeImageUrl(url, width = 800) {
  if (!url || typeof url !== 'string') return '';
  let cleanUrl = url.trim().replace(/\\/g, '/');
  if (!cleanUrl) return '';

  // Ensure relative upload paths start with /
  if (cleanUrl.startsWith('uploads/')) {
    cleanUrl = '/' + cleanUrl;
  }

  // Cloudinary image auto format & compression
  if (cleanUrl.includes('cloudinary.com') && cleanUrl.includes('/upload/')) {
    if (!cleanUrl.includes('/f_auto,q_auto')) {
      return cleanUrl.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
    }
  }

  // Unsplash CDN dynamic optimization
  if (cleanUrl.includes('images.unsplash.com')) {
    try {
      const u = new URL(cleanUrl);
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', '75');
      return u.toString();
    } catch (e) {
      return cleanUrl;
    }
  }

  return cleanUrl;
}

export const SERIES_CATEGORIES = [
  {
    id: 'midweek',
    name: 'Midweek Boost',
    slug: 'midweek-boost',
    description: 'Casual evening gatherings at The Third Place with live music, games, food & great networking.',
    badgeText: 'MIDWEEK BOOST',
    badgeClass: 'cat-badge-midweek',
    icon: 'fa-solid fa-guitar',
    accentColor: '#0d9488',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
    bgLight: '#f0fdfa',
    borderLight: '#99f6e4',
    defaultCover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=75',
    match: (evt) => {
      const title = (evt?.title || '').toLowerCase();
      const cat = (evt?.category || '').toLowerCase();
      return title.includes('midweek') || cat.includes('midweek');
    },
  },
  {
    id: 'guest-talk',
    name: 'Guest Talk',
    displayName: 'Guest Talk Series',
    slug: 'guest-talk',
    description: 'Thought-provoking sessions with global founders, researchers, and technology leaders.',
    badgeText: 'GUEST TALK',
    badgeClass: 'cat-badge-talk',
    icon: 'fa-solid fa-microphone-lines',
    accentColor: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
    bgLight: '#eef2ff',
    borderLight: '#c7d2fe',
    defaultCover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=75',
    match: (evt) => {
      const title = (evt?.title || '').toLowerCase();
      const cat = (evt?.category || '').toLowerCase();
      return (
        title.includes('guest talk') ||
        cat.includes('guest talk') ||
        cat === 'talk' ||
        (title.includes('talk') && !title.includes('midweek'))
      );
    },
  },
  {
    id: 'shed',
    name: 'The SHED',
    displayName: 'The SHED',
    slug: 'the-shed',
    description: 'Exclusive forums exploring innovations in climate tech, sustainability & policy discussions.',
    badgeText: 'THE SHED',
    badgeClass: 'cat-badge-shed',
    icon: 'fa-solid fa-leaf',
    accentColor: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    bgLight: '#f5f3ff',
    borderLight: '#ddd6fe',
    defaultCover: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=75',
    match: (evt) => {
      const title = (evt?.title || '').toLowerCase();
      const cat = (evt?.category || '').toLowerCase();
      return (
        (title.includes('shed') || cat.includes('shed') || cat.includes('policy')) &&
        !title.includes('midweek')
      );
    },
  },
  {
    id: 'reboot-health',
    name: 'REBOOT.health',
    displayName: 'REBOOT.health',
    slug: 'reboot-health',
    description: 'Mind-body wellness, corporate mental resilience, health-tech innovation & mindful living.',
    badgeText: 'REBOOT.HEALTH',
    badgeClass: 'cat-badge-reboot',
    icon: 'fa-solid fa-heart-pulse',
    accentColor: '#059669',
    gradient: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
    bgLight: '#ecfdf5',
    borderLight: '#a7f3d0',
    defaultCover: '/uploads/reboot-health-cover.jpg',
    match: (evt) => {
      const title = (evt?.title || '').toLowerCase();
      const cat = (evt?.category || '').toLowerCase();
      return (
        title.includes('reboot') ||
        cat.includes('reboot') ||
        title.includes('health') ||
        cat.includes('health')
      );
    },
  },
];

export function getEventSeriesCategory(evt) {
  if (!evt) return null;
  for (const series of SERIES_CATEGORIES) {
    if (series.match(evt)) return series;
  }
  return null;
}

/**
 * Standard Space Types across TRACE Venues & Facilities
 */
export const AVAILABLE_SPACE_TYPES = [
  'Meeting Rooms',
  'Conference Hall',
  'Co-Working Spaces',
  'Maker Spaces',
  'Workshop Spaces',
  'Workation',
  'Event Spaces',
  'Coffee Shop',
];

/**
 * Normalizes a single space type string to one of the canonical AVAILABLE_SPACE_TYPES.
 */
export function normalizeSingleSpaceType(item) {
  if (!item || typeof item !== 'string') return '';
  const trimmed = item.trim();
  if (!trimmed) return '';

  const exact = AVAILABLE_SPACE_TYPES.find(
    (opt) => opt.toLowerCase() === trimmed.toLowerCase()
  );
  if (exact) return exact;

  const lower = trimmed.toLowerCase();
  if (lower.includes('coffee') || lower.includes('coffe') || lower.includes('cafe')) return 'Coffee Shop';
  if (lower.includes('workshop')) return 'Workshop Spaces';
  if (lower.includes('workation') || lower.includes('work-cation')) return 'Workation';
  if (lower.includes('conference')) return 'Conference Hall';
  if (lower.includes('maker') || lower.includes('creator') || lower.includes('lab') || lower.includes('fablab')) return 'Maker Spaces';
  if (lower.includes('coworking') || lower.includes('co-working') || lower.includes('incubator') || lower.includes('shared desk')) return 'Co-Working Spaces';
  if (lower.includes('event') || lower.includes('auditorium') || lower.includes('deck')) return 'Event Spaces';
  if (lower.includes('meeting') || lower.includes('room') || lower.includes('suite') || lower.includes('office')) return 'Meeting Rooms';
  if (lower.includes('hall')) return 'Conference Hall';

  return trimmed;
}

/**
 * Extracts and normalizes ALL space types for a venue object into an array.
 * Supports comma-separated strings ("Event Spaces, Maker Spaces") or arrays.
 * @param {Object} v - Venue object
 * @returns {string[]} Array of unique space type names
 */
export function getSpaceTypes(v) {
  if (!v) return ['Meeting Rooms'];

  let rawList = [];
  if (Array.isArray(v.types) && v.types.length > 0) {
    rawList = v.types;
  } else if (Array.isArray(v.type) && v.type.length > 0) {
    rawList = v.type;
  } else if (typeof v.type === 'string' && v.type.trim()) {
    rawList = v.type.split(',').map((s) => s.trim()).filter(Boolean);
  } else if (typeof v.types === 'string' && v.types.trim()) {
    rawList = v.types.split(',').map((s) => s.trim()).filter(Boolean);
  }

  if (rawList.length > 0) {
    const normalized = rawList.map(normalizeSingleSpaceType).filter(Boolean);
    const unique = Array.from(new Set(normalized));
    if (unique.length > 0) return unique;
  }

  // Fallback to name/desc only if venue had no type specified
  const str = `${v.name || ''} ${v.description || ''} ${v.branch || ''}`.toLowerCase();
  if (str.includes('coffee') || str.includes('coffe') || str.includes('cafe')) {
    return ['Coffee Shop'];
  }
  if (str.includes('workshop')) {
    return ['Workshop Spaces'];
  }
  if (str.includes('workation') || str.includes('work-cation') || str.includes('by the sea')) {
    return ['Workation'];
  }
  if (str.includes('conference')) {
    return ['Conference Hall'];
  }
  if (str.includes('maker') || str.includes('creator') || str.includes('bread') || str.includes('lab') || str.includes('fablab')) {
    return ['Maker Spaces'];
  }
  if (str.includes('coworking') || str.includes('co-working') || str.includes('incubator') || str.includes('shared desk') || str.includes('coding hub')) {
    return ['Co-Working Spaces'];
  }
  if (str.includes('deck') || str.includes('terrace') || str.includes('expo') || str.includes('event') || str.includes('auditorium') || str.includes('amphitheater') || str.includes('pavilion') || str.includes('bay 07') || str.includes('bay 7') || str.includes('theatre')) {
    return ['Event Spaces'];
  }
  if (str.includes('hall')) {
    return ['Conference Hall'];
  }

  return ['Meeting Rooms'];
}

/**
 * Returns a comma-joined string of all space types for a venue.
 */
export function getSpaceType(v) {
  const types = getSpaceTypes(v);
  return types.join(', ');
}

/**
 * Helper to derive province for any space
 */
export function getSpaceProvince(v) {
  if (!v) return 'Western Province';
  if (v.province && typeof v.province === 'string' && v.province.trim()) {
    return v.province.trim();
  }
  const str = `${v.branch || ''} ${v.address || ''} ${v.name || ''}`.toLowerCase();

  if (str.includes('colombo') || str.includes('maradana') || str.includes('western') || str.includes('expert city') || str.includes('hometree') || str.includes('uok') || str.includes('kelaniya')) {
    return 'Western Province';
  }
  if (str.includes('kandy') || str.includes('peradeniya') || str.includes('central') || str.includes('jrdc')) {
    return 'Central Province';
  }
  if (str.includes('jaffna') || str.includes('palaly') || str.includes('northern')) {
    return 'Northern Province';
  }
  if (str.includes('galle') || str.includes('fort') || str.includes('southern') || str.includes('matara') || str.includes('ruhuna') || str.includes('mirissa') || str.includes('kamburugamuwa') || str.includes('asaya') || str.includes('ahangama') || str.includes('tangalle')) {
    return 'Southern Province';
  }
  if (str.includes('kurunegala') || str.includes('wayamba') || str.includes('north western') || str.includes('makandura') || str.includes('bread') || str.includes('isb')) {
    return 'North Western Province';
  }
  if (str.includes('rathnapura') || str.includes('ratnapura') || str.includes('creators') || str.includes('sabaragamuwa')) {
    return 'Sabaragamuwa Province';
  }
  if (str.includes('batticaloa') || str.includes('eastern') || str.includes('dreamspace')) {
    return 'Eastern Province';
  }
  if (str.includes('uwu') || str.includes('badulla') || str.includes('uva')) {
    return 'Uva Province';
  }
  return 'Western Province';
}

/**
 * Checks whether a space belongs to Western Province (guaranteeing North Western is not mismatched)
 */
export function isWesternSpace(v) {
  if (!v) return false;
  const prov = getSpaceProvince(v).toLowerCase().trim();
  return prov.includes('western') && !prov.includes('north');
}

/**
 * Returns a FontAwesome icon class for a given space type name.
 */
export function getSpaceTypeIcon(typeStr) {
  const t = (typeStr || '').toLowerCase();
  if (t.includes('coffee') || t.includes('coffe') || t.includes('cafe')) return 'fa-mug-hot';
  if (t.includes('workshop')) return 'fa-screwdriver-wrench';
  if (t.includes('workation')) return 'fa-umbrella-beach';
  if (t.includes('conference') || t.includes('hall')) return 'fa-landmark';
  if (t.includes('maker') || t.includes('creator') || t.includes('lab')) return 'fa-microchip';
  if (t.includes('coworking') || t.includes('co-working')) return 'fa-laptop-code';
  if (t.includes('event')) return 'fa-champagne-glasses';
  if (t.includes('meeting') || t.includes('room')) return 'fa-handshake';
  return 'fa-shapes';
}



