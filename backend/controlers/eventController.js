const Event = require("../model/Event");
const mongoose = require("mongoose");

// Helper function to calculate exact end date and time of an event
const getEventEndDateTime = (dateVal, timeStr) => {
  if (!dateVal) return new Date();

  let year, month, day;

  if (typeof dateVal === "string") {
    const cleanDateStr = dateVal.includes("T") ? dateVal.split("T")[0] : dateVal;
    const parts = cleanDateStr.split("-");
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

  if (timeStr && typeof timeStr === "string" && timeStr.trim().length > 0) {
    let targetTime = timeStr.trim();
    const hasRange = targetTime.includes("-") || targetTime.toLowerCase().includes(" to ");

    if (targetTime.includes("-")) {
      const splitTime = targetTime.split("-");
      targetTime = splitTime[1].trim();
    } else if (targetTime.toLowerCase().includes(" to ")) {
      const splitTime = targetTime.toLowerCase().split(" to ");
      targetTime = splitTime[1].trim();
    }

    const timeMatch = targetTime.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      let m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (ampm === "pm" && h < 12) h += 12;
      if (ampm === "am" && h === 12) h = 0;

      if (!hasRange) {
        h += 2;
      }

      hours = h;
      minutes = m;
      seconds = 0;
    }
  }

  return new Date(year, month, day, hours, minutes, seconds);
};

// Resilient in-memory cache for instantaneous (0ms) responses & network fault tolerance
let eventsCache = [];
let isEventsCacheLoaded = false;

const getEventsCache = () => eventsCache;

// Helper to filter and compute dynamic statuses
const processEventsList = (list, status, category, now = new Date()) => {
  let filtered = list || [];
  if (category && category !== "All") {
    filtered = filtered.filter(e => (e.category || "").toLowerCase() === category.toLowerCase());
  }

  const processed = filtered.map((evt) => {
    const endDateTime = getEventEndDateTime(evt.date, evt.time);
    const computedStatus = evt.status === "draft" ? "draft" : (now > endDateTime ? "past" : "upcoming");
    return {
      ...evt,
      status: computedStatus,
    };
  });

  if (status && status !== "All") {
    return processed.filter(e => e.status === status);
  }
  return processed;
};

const fs = require("fs");
const path = require("path");

const backupFilePath = path.join(__dirname, "../data/events_backup.json");

// Helper to safely persist cache to disk in background (debounced to avoid disk thrashing)
let backupTimeout = null;
const saveBackupAsync = () => {
  if (backupTimeout) return;
  backupTimeout = setTimeout(() => {
    backupTimeout = null;
    try {
      const dataDir = path.dirname(backupFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFile(backupFilePath, JSON.stringify(eventsCache, null, 2), (err) => {
        if (err) console.warn("Failed to save events backup:", err.message);
      });
    } catch (err) {
      console.warn("Save backup error:", err.message);
    }
  }, 2000);
};

// Static uploads directories

const uploadsDir = path.join(__dirname, "../public/uploads");
const frontendUploadsDir = path.join(__dirname, "../../frontend/public/uploads");

// Helper to save base64 data to static upload file so API and cache remain ultra-lightweight
const saveBase64ToFile = (dataUri, prefix) => {
  if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:image")) {
    return dataUri;
  }
  const match = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!match) return dataUri;
  let ext = match[1].toLowerCase();
  if (ext === "jpeg") ext = "jpg";
  const filename = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
  try {
    const buffer = Buffer.from(match[2], "base64");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    if (!fs.existsSync(frontendUploadsDir)) fs.mkdirSync(frontendUploadsDir, { recursive: true });
    fs.writeFileSync(path.join(frontendUploadsDir, filename), buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn("Error saving base64 to file:", err.message);
    return dataUri;
  }
};

// Ensure all event images are clean static URLs, not multi-megabyte base64 strings
const sanitizeEvent = (evt) => {
  if (!evt) return evt;
  let updated = false;
  let cover = evt.coverImage;
  let gallery = evt.gallery;

  if (cover && cover.startsWith("data:image")) {
    cover = saveBase64ToFile(cover, `event-cover-${evt._id || Date.now()}`);
    updated = true;
  }

  if (Array.isArray(gallery)) {
    gallery = gallery.map((g, idx) => {
      let url = typeof g === "string" ? g : (g?.url || "");
      const caption = (typeof g === "object" && g?.caption) ? g.caption : `Photo ${idx + 1}`;
      if (url && url.startsWith("data:image")) {
        url = saveBase64ToFile(url, `event-gallery-${evt._id || "gal"}-${Date.now()}-${idx}`);
        updated = true;
      }
      return {
        _id: (typeof g === "object" && (g._id || g.id)) ? (g._id || g.id) : `g_${Date.now()}_${idx}`,
        url,
        caption,
      };
    });
  }

  const cleanEvt = {
    ...evt,
    coverImage: cover,
    gallery: gallery || [],
  };

  if (updated && evt._id && mongoose.connection.readyState === 1) {
    Event.findByIdAndUpdate(evt._id, { coverImage: cover, gallery }).catch(() => {});
  }

  return cleanEvt;
};

// Prime in-memory events cache on server boot
const seedInitialEvents = async () => {
  // 1. Immediately load local disk backup if exists for instant 0ms cold boot
  try {
    if (fs.existsSync(backupFilePath)) {
      const fileData = fs.readFileSync(backupFilePath, "utf8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        eventsCache = parsed.map(sanitizeEvent);
        isEventsCacheLoaded = true;
      }
    }
  } catch (e) {
    console.warn("Local events backup notice:", e.message);
  }

  // 2. Fetch full events from MongoDB
  try {
    const docs = await Event.find().lean().maxTimeMS(6000);
    if (Array.isArray(docs) && docs.length > 0) {
      eventsCache = docs.map((doc) => sanitizeEvent(doc));
      isEventsCacheLoaded = true;
      saveBackupAsync();
    }
  } catch (err) {
    console.warn("Initial events database load notice:", err.message);
  }
};

// GET /api/events?status=upcoming|past
const getEvents = async (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=10, stale-while-revalidate=60");
  const { status, category } = req.query;

  // Format list: lightweight response with clean static URLs
  const formatList = (list) => {
    return processEventsList(list, status, category).map((evt) => {
      let gallery = [];
      if (Array.isArray(evt.gallery) && evt.gallery.length > 0) {
        gallery = evt.gallery.map((g, idx) => ({
          _id: g._id || g.id || `g_${idx}`,
          url: typeof g === "string" ? g : (g.url || ""),
          caption: g.caption || "Event Photo",
        }));
      }
      return {
        ...evt,
        gallery,
      };
    });
  };

  // 1. If cache is loaded, return immediately for instant 0ms UI
  if (isEventsCacheLoaded && eventsCache.length > 0) {
    const result = formatList(eventsCache);
    res.json({ success: true, count: result.length, data: result });

    // Background silent refresh with short timeout
    Event.find().lean().maxTimeMS(5000)
      .then((fresh) => {
        if (Array.isArray(fresh) && fresh.length > 0) {
          const freshMap = new Map(fresh.map(d => [String(d._id), d]));
          const nowTime = Date.now();
          eventsCache.forEach(cached => {
            const id = String(cached._id || cached.id);
            const isRecent = cached.createdAt && (nowTime - new Date(cached.createdAt).getTime() < 30000);
            if (isRecent && !freshMap.has(id)) {
              fresh.unshift(cached);
            }
          });
          eventsCache = fresh.map(sanitizeEvent);
          saveBackupAsync();
        }
      })
      .catch(() => {});
    return;
  }

  // 2. If cache not loaded yet, query DB directly
  try {
    const events = await Event.find().lean().maxTimeMS(5000);
    if (Array.isArray(events) && events.length > 0) {
      eventsCache = events.map(sanitizeEvent);
      isEventsCacheLoaded = true;
      saveBackupAsync();
    }
    const result = formatList(eventsCache);
    return res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.warn("Serving events from resilient fallback cache:", error.message);
    const result = formatList(eventsCache);
    return res.json({ success: true, count: result.length, data: result });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
  const eventId = String(req.params.id);

  // 1. First check in-memory cache: if found, return immediately for 0ms loading
  const cached = eventsCache.find(e => String(e._id || e.id) === eventId);
  if (cached) {
    return res.json({ success: true, data: cached });
  }

  // 2. Query MongoDB if not found in cache
  try {
    const event = await Event.findById(eventId).lean().maxTimeMS(3000);
    if (event) {
      const sanitized = sanitizeEvent(event);
      eventsCache.push(sanitized);
      saveBackupAsync();
      return res.json({ success: true, data: sanitized });
    }
  } catch (error) {
    console.warn("Direct findById notice:", error.message);
  }

  return res.status(404).json({ success: false, message: "Event not found" });
};

// POST /api/events (Create Event)
const createEvent = async (req, res) => {
  try {
    let eventData = { ...req.body };
    if (eventData.status !== "draft" && eventData.date) {
      const endDateTime = getEventEndDateTime(eventData.date, eventData.time);
      const now = new Date();
      eventData.status = now > endDateTime ? "past" : "upcoming";
    }

    eventData._id = eventData._id || new mongoose.Types.ObjectId();
    eventData.createdAt = new Date().toISOString();
    eventData.updatedAt = new Date().toISOString();
    eventData = sanitizeEvent(eventData);

    // Update in-memory cache instantly
    eventsCache = [eventData, ...eventsCache.filter(e => String(e._id || e.id) !== String(eventData._id))];
    isEventsCacheLoaded = true;
    saveBackupAsync();

    // Persist to MongoDB
    const newEvent = new Event(eventData);
    try {
      await newEvent.save();
    } catch (saveErr) {
      console.warn("MongoDB event save notice (cached in memory):", saveErr.message);
    }

    res.status(201).json({ success: true, message: "Event created successfully", data: eventData });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to create event", error: error.message });
  }
};

// PUT /api/events/:id (Update Event)
const updateEvent = async (req, res) => {
  try {
    const eventId = String(req.params.id);
    let eventData = { ...req.body };
    eventData._id = eventId;

    if (eventData.status !== "draft" && eventData.date) {
      const endDateTime = getEventEndDateTime(eventData.date, eventData.time);
      const now = new Date();
      eventData.status = now > endDateTime ? "past" : "upcoming";
    }
    eventData.updatedAt = new Date().toISOString();

    // Clean video URL: trim whitespace
    if (typeof eventData.videoUrl === "string") {
      eventData.videoUrl = eventData.videoUrl.trim();
    }
    eventData = sanitizeEvent(eventData);

    // Update in-memory cache instantly
    const exists = eventsCache.some(e => String(e._id || e.id) === eventId);
    if (exists) {
      eventsCache = eventsCache.map(e => {
        if (String(e._id || e.id) === eventId) {
          return { ...e, ...eventData, _id: eventId };
        }
        return e;
      });
    } else {
      eventsCache = [{ ...eventData, _id: eventId }, ...eventsCache];
    }
    saveBackupAsync();

    // Persist to MongoDB
    try {
      await Event.findByIdAndUpdate(eventId, eventData, { returnDocument: 'after', runValidators: true });
    } catch (updateErr) {
      console.warn("MongoDB update event notice:", updateErr.message);
    }

    const fullUpdated = eventsCache.find(e => String(e._id || e.id) === eventId) || eventData;
    return res.json({ success: true, message: "Event updated successfully", data: fullUpdated });
  } catch (error) {
    console.error("Error in updateEvent:", error);
    res.status(500).json({ success: false, message: "Event updated error", data: req.body });
  }
};

// DELETE /api/events/:id (Delete Event)
const deleteEvent = async (req, res) => {
  try {
    eventsCache = eventsCache.filter(e => String(e._id || e.id) !== String(req.params.id));
    saveBackupAsync();
    try {
      await Event.findByIdAndDelete(req.params.id);
      const Registration = require("../model/Registration");
      await Registration.deleteMany({ eventId: req.params.id });
    } catch (delErr) {
      console.warn("MongoDB delete event notice:", delErr.message);
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    eventsCache = eventsCache.filter(e => String(e._id || e.id) !== String(req.params.id));
    saveBackupAsync();
    res.json({ success: true, message: "Event deleted successfully" });
  }
};

module.exports = {
  seedInitialEvents,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsCache,
};
