const Registration = require("../model/Registration");
const Event = require("../model/Event");

// Generate unique ticket ID
const generateTicketId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "EVT-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// POST /api/registrations
const registerForEvent = async (req, res) => {
  try {
    const { eventId, name, email, contactNumber, notes } = req.body;

    if (!eventId || !name || !email || !contactNumber) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields (name, email, contact number)." });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.status === "past") {
      return res.status(400).json({ success: false, message: "Cannot register for past events." });
    }

    // Atomically reserve a slot if capacity is available
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: { $ne: "past" },
        $expr: { $lt: ["$registeredCount", "$capacity"] },
      },
      { $inc: { registeredCount: 1 } },
      { returnDocument: 'after' }
    );

    if (!updatedEvent) {
      return res.status(400).json({ success: false, message: "Sorry, this event is fully booked or closed for registration." });
    }

    // Check if user is already registered for this event
    const existingRegistration = await Registration.findOne({ eventId, email: email.toLowerCase() });
    if (existingRegistration) {
      // Revert increment
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event with this email address.",
        data: existingRegistration,
      });
    }

    const ticketId = generateTicketId();

    const registration = new Registration({
      eventId: event._id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      name,
      email: email.toLowerCase(),
      contactNumber,
      notes: notes || "",
      ticketId,
      status: "Confirmed",
    });

    try {
      await registration.save();
      registrationsCache = [registration.toObject ? registration.toObject() : registration, ...registrationsCache];
    } catch (saveErr) {
      // Revert reservation on failure
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
      throw saveErr;
    }

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: {
        registration,
        event: {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          description: event.description,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

// GET /api/registrations/user/:email
const getUserRegistrations = async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();

    // Verify caller identity: user can only view their own registrations unless they are an admin
    const isAdmin = req.user && ["admin", "super_admin", "branch_admin"].includes(req.user.role);
    if (!isAdmin && (!req.user || req.user.email.toLowerCase() !== email)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only view your own event registrations." });
    }

    const registrations = await Registration.find({ email }).populate("eventId").sort({ createdAt: -1 });
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user registrations", error: error.message });
  }
};

// GET /api/registrations/event/:eventId
const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event registrations", error: error.message });
  }
};

// In-memory cache for instantaneous (0ms) response times
let registrationsCache = [];

// GET /api/registrations (All registrations for Admin Dashboard)
const getAllRegistrations = async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (registrationsCache.length > 0) {
    res.json({ success: true, count: registrationsCache.length, data: registrationsCache });
    // Silent background refresh
    Registration.find().populate("eventId").sort({ createdAt: -1 }).lean()
      .then((fresh) => {
        if (Array.isArray(fresh)) registrationsCache = fresh;
      })
      .catch(() => {});
    return;
  }

  try {
    const registrations = await Registration.find().populate("eventId").sort({ createdAt: -1 }).lean();
    if (Array.isArray(registrations)) {
      registrationsCache = registrations;
    }
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch registrations", error: error.message });
  }
};

// PUT /api/registrations/:id (Update status / notes)
const updateRegistration = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    if (status) registration.status = status;
    if (notes !== undefined) registration.notes = notes;

    await registration.save();

    // Update in-memory cache
    registrationsCache = registrationsCache.map(r =>
      String(r._id) === String(req.params.id)
        ? { ...r, status: status || r.status, notes: notes !== undefined ? notes : r.notes }
        : r
    );

    res.json({ success: true, message: "Registration updated successfully", data: registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update registration", error: error.message });
  }
};

module.exports = {
  registerForEvent,
  getUserRegistrations,
  getEventRegistrations,
  getAllRegistrations,
  updateRegistration,
};
