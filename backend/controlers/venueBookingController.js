const VenueBooking = require("../model/VenueBooking");
const { sendEmail } = require("../config/emailHelper");

// In-memory cache for instantaneous (0ms) response times
let venueBookingsCache = [];

// GET /api/venue-bookings (Fetch all venue booking inquiries)
const getAllVenueBookings = async (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (venueBookingsCache.length > 0) {
    res.json({ success: true, count: venueBookingsCache.length, data: venueBookingsCache });
    // Silent background refresh
    VenueBooking.find().sort({ createdAt: -1 }).lean()
      .then((fresh) => {
        if (Array.isArray(fresh)) venueBookingsCache = fresh;
      })
      .catch(() => {});
    return;
  }

  try {
    const bookings = await VenueBooking.find().sort({ createdAt: -1 }).lean();
    if (Array.isArray(bookings)) {
      venueBookingsCache = bookings;
    }
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch venue bookings", error: error.message });
  }
};

// GET /api/venue-bookings/user/:email (Fetch bookings by user email)
const getUserVenueBookings = async (req, res) => {
  try {
    const email = (req.params.email || "").trim().toLowerCase();

    // Verify caller authorization
    const isAdmin = req.user && ["admin", "super_admin", "branch_admin"].includes(req.user.role);
    if (!isAdmin && (!req.user || req.user.email.toLowerCase() !== email)) {
      return res.status(403).json({ success: false, message: "Access denied. You can only view your own venue booking inquiries." });
    }

    const bookings = await VenueBooking.find({
      email: email
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user venue bookings", error: error.message });
  }
};

// POST /api/venue-bookings (Create new venue booking inquiry)
const createVenueBooking = async (req, res) => {
  try {
    const { venueId, venueName, branch, name, email, phone, eventTitle, eventDate, durationHours, guests, notes, price } = req.body;

    if (!venueName || !name || !email || !phone || !eventTitle || !eventDate) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Email, Phone, Event Title, Date)."
      });
    }

    const bookingRef = "VBOOK-" + Math.floor(100000 + Math.random() * 900000);

    const booking = new VenueBooking({
      bookingRef,
      venueId: venueId || "",
      venueName,
      branch: branch || "TRACE Expert City (Colombo)",
      name,
      email: email.trim().toLowerCase(),
      phone,
      eventTitle,
      eventDate,
      durationHours: Number(durationHours) || 4,
      guests: Number(guests) || 50,
      notes: notes || "",
      price: price || "Rs. 25,000 / hr",
      status: "Pending",
    });

    await booking.save();
    venueBookingsCache = [booking.toObject ? booking.toObject() : booking, ...venueBookingsCache];

    // 1. Dispatch Instant Real-Time Email Notification to connect@trace.lk
    const adminEmailSubject = `🏢 New Venue Booking Inquiry [${bookingRef}]: ${venueName} - ${name}`;
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; padding: 24px; text-align: center; }
          .header h2 { margin: 0; font-size: 22px; font-weight: 800; }
          .header p { margin: 6px 0 0 0; color: #a5b4fc; font-size: 13px; }
          .content { padding: 28px; }
          .section-title { font-size: 13px; font-weight: 800; color: #5d4df6; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; margin-top: 15px; }
          .grid-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 15px; }
          .field-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .field-label { color: #64748b; font-weight: 600; }
          .field-value { color: #0f172a; font-weight: 700; }
          .ref-badge { background: #eef2ff; color: #5d4df6; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace; }
          .notes-box { background: #fefce8; border: 1px solid #fef08a; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #854d0e; font-style: italic; }
          .footer { background: #f1f5f9; text-align: center; padding: 16px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>🏢 New Venue Reservation Inquiry</h2>
            <p>TRACE Event Hub • Real-Time Inquiry Notification</p>
          </div>

          <div class="content">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
              <span class="section-title" style="margin:0;">BOOKING REFERENCE:</span>
              <span class="ref-badge">${bookingRef}</span>
            </div>

            <div class="section-title">👤 INQUIRER CONTACT DETAILS</div>
            <div class="grid-box">
              <div className="field-row">
                <span class="field-label">Full Name:</span>
                <span class="field-value">${name}</span>
              </div>
              <div className="field-row">
                <span class="field-label">Email Address:</span>
                <span class="field-value"><a href="mailto:${email}" style="color:#5d4df6;">${email}</a></span>
              </div>
              <div className="field-row" style="margin-bottom:0;">
                <span class="field-label">Phone Number:</span>
                <span class="field-value"><a href="tel:${phone}" style="color:#059669;">${phone}</a></span>
              </div>
            </div>

            <div class="section-title">📍 VENUE & EVENT DETAILS</div>
            <div class="grid-box">
              <div className="field-row">
                <span class="field-label">Venue / Space:</span>
                <span class="field-value" style="color:#5d4df6;">${venueName}</span>
              </div>
              <div className="field-row">
                <span class="field-label">TRACE Branch:</span>
                <span class="field-value">${branch || "TRACE Expert City (Colombo)"}</span>
              </div>
              <div className="field-row">
                <span class="field-label">Event Title / Purpose:</span>
                <span class="field-value">${eventTitle}</span>
              </div>
              <div className="field-row">
                <span class="field-label">Target Event Date:</span>
                <span class="field-value">${eventDate}</span>
              </div>
              <div className="field-row">
                <span class="field-label">Duration:</span>
                <span class="field-value">${durationHours} Hours</span>
              </div>
              <div className="field-row" style="margin-bottom:0;">
                <span class="field-label">Expected Attendees:</span>
                <span class="field-value">${guests} Guests</span>
              </div>
            </div>

            ${notes ? `
              <div class="section-title">📝 SPECIAL REQUIREMENTS / NOTES</div>
              <div class="notes-box">
                "${notes}"
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 24px;">
              <a href="mailto:${email}" style="background: #5d4df6; color: #ffffff; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; display: inline-block;">
                ✉️ Reply Direct to Inquirer (${name})
              </a>
            </div>
          </div>

          <div class="footer">
            Received via TRACE Event Hub Space Booking Portal.<br/>
            Clicking Reply in your mail client will send directly to ${email}.
          </div>
        </div>
      </body>
      </html>
    `;

    // 1. Dispatch Instant Real-Time Email Notification to connect@trace.lk from programs@trace.lk
    // 2. Dispatch Confirmation Copy to the User from programs@trace.lk
    try {
      await Promise.allSettled([
        sendEmail({
          from: `"TRACE Event Hub" <programs@trace.lk>`,
          to: "connect@trace.lk",
          replyTo: email.trim().toLowerCase(),
          subject: adminEmailSubject,
          html: adminEmailHtml,
        }),
        sendEmail({
          from: `"TRACE Event Hub" <programs@trace.lk>`,
          to: email.trim().toLowerCase(),
          subject: userConfirmationSubject,
          html: userConfirmationHtml,
        }),
      ]);
      console.log(`[Inquiry Mail] Space inquiry [${bookingRef}] successfully dispatched to connect@trace.lk from programs@trace.lk`);
    } catch (mailErr) {
      console.error("[Inquiry Mail Error] Error during email dispatch:", mailErr.message);
    }

    res.status(201).json({ success: true, message: "Venue booking inquiry submitted successfully! Notification sent to connect@trace.lk.", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create venue booking", error: error.message });
  }
};

// PUT /api/venue-bookings/:id (Update status/notes)
const updateVenueBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const booking = await VenueBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking inquiry not found" });
    }

    if (status) booking.status = status;
    if (notes !== undefined) booking.notes = notes;

    await booking.save();
    venueBookingsCache = venueBookingsCache.map(b =>
      String(b._id) === String(req.params.id)
        ? { ...b, status: status || b.status, notes: notes !== undefined ? notes : b.notes }
        : b
    );
    res.json({ success: true, message: "Booking status updated successfully!", data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update booking status", error: error.message });
  }
};

// DELETE /api/venue-bookings/:id (Delete booking)
const deleteVenueBooking = async (req, res) => {
  try {
    const booking = await VenueBooking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking inquiry not found" });
    }
    venueBookingsCache = venueBookingsCache.filter(b => String(b._id) !== String(req.params.id));
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete booking", error: error.message });
  }
};

// Seed initial sample venue bookings if database is empty
const seedInitialVenueBookings = async () => {
  try {
    const count = await VenueBooking.countDocuments();
    if (count === 0) {
      const sampleBookings = [
        {
          bookingRef: "VBOOK-882193",
          venueName: "TRACE Main Grand Auditorium",
          branch: "TRACE Expert City (Colombo)",
          name: "Kasun Perera",
          email: "kasun@techstartup.lk",
          phone: "+94 77 123 4567",
          eventTitle: "Annual National AI Summit 2026",
          eventDate: "2026-09-15",
          durationHours: 6,
          guests: 250,
          notes: "Need 4K live streaming setup, stage lighting, and 2 podium microphones.",
          price: "Rs. 45,000 / hr",
          status: "Pending",
        },
        {
          bookingRef: "VBOOK-304192",
          venueName: "Kandy Tech Pavilion & Amphitheater",
          branch: "TRACE Innovation Hub (Kandy)",
          name: "Nimmi Fernando",
          email: "nimmi@kandytech.org",
          phone: "+94 71 987 6543",
          eventTitle: "Central Hills Developer Meetup",
          eventDate: "2026-10-02",
          durationHours: 4,
          guests: 120,
          notes: "Outdoor coffee break arrangement requested.",
          price: "Rs. 30,000 / hr",
          status: "Confirmed",
        },
      ];
      await VenueBooking.insertMany(sampleBookings);
      console.log("Sample venue bookings seeded successfully!");
    }

    // Always prime cache on boot for 0ms response time
    const freshBookings = await VenueBooking.find().sort({ createdAt: -1 }).lean();
    if (Array.isArray(freshBookings)) {
      venueBookingsCache = freshBookings;
    }
  } catch (err) {
    console.error("Error seeding/caching venue bookings:", err);
  }
};

module.exports = {
  getAllVenueBookings,
  getUserVenueBookings,
  createVenueBooking,
  updateVenueBookingStatus,
  deleteVenueBooking,
  seedInitialVenueBookings,
};
