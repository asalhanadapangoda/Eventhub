/**
 * EventHub Application Logic
 */

class EventHubApp {
  constructor() {
    this.events = [];
    this.activeTab = "upcoming"; // "upcoming" | "past"
    this.searchQuery = "";
    this.currentLightboxGallery = [];
    this.currentLightboxIndex = 0;
    this.lastRegistrationData = null;
    this.currentUser = null;
    this.token = localStorage.getItem("eventhub_token") || null;

    this.init();
  }

  async init() {
    await this.checkAuthStatus();
    await this.fetchEvents();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Escape key closes open modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals();
      }
    });
  }

  async fetchEvents() {
    const spinner = document.getElementById("loading-spinner");
    const emptyState = document.getElementById("empty-state");
    const grid = document.getElementById("events-grid");

    try {
      spinner.classList.remove("hidden");
      emptyState.classList.add("hidden");
      grid.innerHTML = "";

      const response = await fetch("/api/events");
      const result = await response.json();

      if (result.success) {
        this.events = result.data;
        this.updateCounts();
        this.renderEvents();
      } else {
        this.showToast(result.message || "Failed to load events", "error");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      this.showToast("Failed to connect to event server", "error");
    } finally {
      spinner.classList.add("hidden");
    }
  }

  updateCounts() {
    const upcoming = this.events.filter((e) => e.status === "upcoming").length;
    const past = this.events.filter((e) => e.status === "past").length;

    document.getElementById("upcoming-count").textContent = upcoming;
    document.getElementById("past-count").textContent = past;
  }

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update nav links & tab pills
    document.querySelectorAll(".nav-link").forEach((el) => el.classList.remove("active"));
    document.querySelectorAll(".tab-pill").forEach((el) => el.classList.remove("active"));

    if (tabName === "upcoming") {
      document.getElementById("tab-upcoming")?.classList.add("active");
      document.getElementById("filter-upcoming")?.classList.add("active");
    } else if (tabName === "past") {
      document.getElementById("tab-past")?.classList.add("active");
      document.getElementById("filter-past")?.classList.add("active");
    }

    this.renderEvents();
  }

  scrollToHero() {
    document.querySelectorAll(".nav-link").forEach((el) => el.classList.remove("active"));
    document.getElementById("tab-home")?.classList.add("active");
    document.getElementById("hero-section")?.scrollIntoView({ behavior: "smooth" });
  }

  scrollToEvents(tabName = "upcoming") {
    this.switchTab(tabName);
    document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
  }

  focusSearch() {
    this.scrollToEvents("upcoming");
    const input = document.getElementById("search-input");
    if (input) input.focus();
  }

  filterEvents() {
    this.searchQuery = document.getElementById("search-input").value.toLowerCase().trim();
    this.renderEvents();
  }

  renderEvents() {
    const grid = document.getElementById("events-grid");
    const emptyState = document.getElementById("empty-state");

    grid.innerHTML = "";

    const filtered = this.events.filter((event) => {
      const matchesTab = event.status === this.activeTab;
      const matchesSearch =
        !this.searchQuery ||
        event.title.toLowerCase().includes(this.searchQuery) ||
        event.description.toLowerCase().includes(this.searchQuery) ||
        event.category.toLowerCase().includes(this.searchQuery) ||
        (event.speaker && event.speaker.name.toLowerCase().includes(this.searchQuery));

      return matchesTab && matchesSearch;
    });

    if (filtered.length === 0) {
      emptyState.classList.remove("hidden");
      return;
    } else {
      emptyState.classList.add("hidden");
    }

    filtered.forEach((event) => {
      const card = this.createEventCard(event);
      grid.appendChild(card);
    });
  }

  createEventCard(event) {
    const card = document.createElement("div");
    card.className = "event-card";

    const dateObj = new Date(event.date);
    const monthStr = dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
    const dayStr = String(dateObj.getDate()).padStart(2, '0');
    const yearStr = dateObj.getFullYear();
    const formattedDate = `${monthStr} ${dayStr}, ${yearStr} • ${event.time}`;

    const isUpcoming = event.status === "upcoming";

    // Category class selector
    let catClass = "cat-default";
    const lowerCat = (event.category || "").toLowerCase();
    if (lowerCat.includes("workshop")) catClass = "cat-workshop";
    else if (lowerCat.includes("meetup")) catClass = "cat-meetup";
    else if (lowerCat.includes("sprint")) catClass = "cat-sprint";

    // Gallery section if past event
    let galleryHtml = "";
    if (!isUpcoming && event.gallery && event.gallery.length > 0) {
      galleryHtml = `
        <div class="gallery-section" style="margin-top: 0.75rem;">
          <div class="gallery-title" style="font-size:0.8rem; font-weight:700; color:var(--text-muted); margin-bottom:0.5rem;">
            <i class="fa-solid fa-camera"></i> Photo Highlights (${event.gallery.length})
          </div>
          <div class="gallery-grid" style="display:grid; grid-template-columns:repeat(4,1fr); gap:0.4rem;">
            ${event.gallery
              .slice(0, 4)
              .map(
                (img, idx) => {
                  const url = typeof img === 'string' ? img : (img.url || img);
                  return `
              <div class="gallery-thumb" onclick="app.openGalleryLightbox('${event._id}', ${idx})" style="height:50px; border-radius:6px; overflow:hidden; cursor:pointer;">
                <img src="${url}" alt="Gallery photo" style="width:100%; height:100%; object-fit:cover;">
              </div>
            `;
                }
              )
              .join("")}
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="card-banner">
        <img src="${event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80'}" alt="${event.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';">
        <span class="category-tag-pill ${catClass}">${event.category}</span>
      </div>
      <div class="card-body">
        <div class="event-datetime">${formattedDate}</div>
        <h3 class="card-title">${event.title}</h3>
        
        <div class="card-location">
          <i class="fa-solid fa-location-dot" style="color: var(--teal-accent);"></i>
          <span>${event.location}</span>
        </div>

        <p class="card-desc">${event.description}</p>

        ${galleryHtml}

        ${
          isUpcoming
            ? `
          <button class="btn-card-action" onclick="app.openRegistrationModal('${event._id}')">
            View Details / Register
          </button>
        `
            : `
          <button class="btn-card-secondary" onclick="app.openGalleryLightbox('${event._id}', 0)">
            <i class="fa-solid fa-images"></i> View Event Showcase
          </button>
        `
        }
      </div>
    `;

    return card;
  }

  // Registration Modal Logic
  openRegistrationModal(eventId) {
    const event = this.events.find((e) => e._id === eventId);
    if (!event) return;

    document.getElementById("reg-event-id").value = event._id;
    document.getElementById("reg-event-title").textContent = event.title;

    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    document.getElementById("reg-event-meta").innerHTML = `
      <i class="fa-regular fa-clock"></i> ${formattedDate} @ ${event.time} | <i class="fa-solid fa-location-dot"></i> ${event.location}
    `;

    // Pre-fill user details if logged in, otherwise clear
    document.getElementById("reg-name").value = this.currentUser ? this.currentUser.name || "" : "";
    document.getElementById("reg-email").value = this.currentUser ? this.currentUser.email || "" : "";
    document.getElementById("reg-phone").value = this.currentUser ? this.currentUser.contactNumber || "" : "";
    document.getElementById("reg-notes").value = "";

    this.openModal("registration-modal");
  }

  async handleRegistrationSubmit(e) {
    e.preventDefault();

    const eventId = document.getElementById("reg-event-id").value;
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const contactNumber = document.getElementById("reg-phone").value.trim();
    const notes = document.getElementById("reg-notes").value.trim();

    const submitBtn = document.getElementById("reg-submit-btn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering...`;

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, name, email, contactNumber, notes }),
      });

      const result = await response.json();

      if (result.success) {
        this.closeModal("registration-modal");
        this.lastRegistrationData = result.data;
        this.showConfirmationModal(result.data);
        await this.fetchEvents(); // Refresh capacity counts
      } else {
        this.showToast(result.message || "Registration failed", "error");
      }
    } catch (error) {
      console.error("Error registering:", error);
      this.showToast("Network error during registration", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Complete Free Registration`;
    }
  }

  showConfirmationModal(data) {
    const { registration, event } = data;

    document.getElementById("ticket-id-display").textContent = registration.ticketId;
    document.getElementById("ticket-event-title").textContent = event.title;

    const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    document.getElementById("ticket-event-date").textContent = `${formattedDate} @ ${event.time}`;
    document.getElementById("ticket-event-location").textContent = event.location;
    document.getElementById("ticket-attendee-name").textContent = registration.name;

    // Attach `.ics` file download action
    const btnIcs = document.getElementById("btn-download-ics");
    btnIcs.onclick = () => this.downloadIcsCalendarFile(registration, event);

    // Attach Google Calendar action
    const btnGCal = document.getElementById("btn-google-calendar");
    btnGCal.onclick = () => this.openGoogleCalendarUrl(event);

    this.openModal("confirmation-modal");
  }

  // Generate .ics iCalendar file with 1-day prior reminder trigger
  downloadIcsCalendarFile(registration, event) {
    const eventDate = new Date(event.date);

    // Format dates to UTC YYYYMMDDTHHMMSSZ
    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    };

    const startDateStr = formatDate(eventDate);
    const endDateStr = formatDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000)); // +2 hours duration

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EventHub Community//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:${registration.ticketId}@eventhub.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, " ")} | Ticket Pass: ${registration.ticketId}`,
      `LOCATION:${event.location}`,
      "STATUS:CONFIRMED",
      // 1-Day Before Reminder Alarm Trigger
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: 1 Day until ${event.title}`,
      "TRIGGER:-P1D",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}_Reminder.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast("Downloaded 1-Day Reminder Calendar Invite (.ics)", "success");
  }

  openGoogleCalendarUrl(event) {
    const eventDate = new Date(event.date);
    const formatDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const start = formatDate(eventDate);
    const end = formatDate(new Date(eventDate.getTime() + 2 * 60 * 60 * 1000));

    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.title
    )}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(
      event.location
    )}&add=1day_reminder`;

    window.open(gCalUrl, "_blank");
  }

  requestBrowserNotificationPermission() {
    if (!("Notification" in window)) {
      this.showToast("Browser notifications are not supported on this browser.", "error");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        this.showToast("Browser reminder notifications enabled! You will be notified 1 day before the event.", "success");
        new Notification("EventHub Reminder Set!", {
          body: "We will notify you 1 day prior to your upcoming event.",
          icon: "/favicon.ico",
        });
      } else {
        this.showToast("Browser notification permission was denied.", "error");
      }
    });
  }

  // Gallery Lightbox Modal
  openGalleryLightbox(eventId, startIndex = 0) {
    const event = this.events.find((e) => e._id === eventId);
    if (!event || !event.gallery || event.gallery.length === 0) {
      this.showToast("No gallery photos available for this event.", "info");
      return;
    }

    this.currentLightboxGallery = event.gallery;
    this.currentLightboxIndex = startIndex;
    this.updateLightboxImage();
    this.openModal("lightbox-modal");
  }

  updateLightboxImage() {
    const imgObj = this.currentLightboxGallery[this.currentLightboxIndex];
    const url = typeof imgObj === "string" ? imgObj : (imgObj?.url || imgObj);
    const caption = typeof imgObj === "string" ? "Event Photograph" : (imgObj?.caption || "Event Photograph");
    document.getElementById("lightbox-img").src = url;
    document.getElementById("lightbox-caption").textContent = caption;
    document.getElementById("gallery-counter").textContent = `${this.currentLightboxIndex + 1} of ${
      this.currentLightboxGallery.length
    }`;
  }

  prevGalleryImage() {
    if (this.currentLightboxIndex > 0) {
      this.currentLightboxIndex--;
      this.updateLightboxImage();
    } else {
      this.currentLightboxIndex = this.currentLightboxGallery.length - 1;
      this.updateLightboxImage();
    }
  }

  nextGalleryImage() {
    if (this.currentLightboxIndex < this.currentLightboxGallery.length - 1) {
      this.currentLightboxIndex++;
      this.updateLightboxImage();
    } else {
      this.currentLightboxIndex = 0;
      this.updateLightboxImage();
    }
  }

  // Lookup user registrations
  openMyRegistrationsModal() {
    document.getElementById("user-registrations-list").innerHTML = "";
    document.getElementById("lookup-email-input").value = "";
    this.openModal("my-registrations-modal");
  }

  async lookupRegistrations() {
    const email = document.getElementById("lookup-email-input").value.trim();
    if (!email) {
      this.showToast("Please enter an email address", "error");
      return;
    }

    const container = document.getElementById("user-registrations-list");
    container.innerHTML = `<div class="spinner"></div>`;

    try {
      const response = await fetch(`/api/registrations/user/${encodeURIComponent(email)}`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        container.innerHTML = result.data
          .map((reg) => {
            const formattedDate = new Date(reg.eventDate).toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return `
            <div class="ticket-item">
              <div class="ticket-info">
                <h4>${reg.eventTitle}</h4>
                <p><i class="fa-regular fa-calendar"></i> ${formattedDate} | Pass ID: <strong>${reg.ticketId}</strong></p>
                <p><i class="fa-solid fa-location-dot"></i> ${reg.eventLocation}</p>
              </div>
              <button class="btn btn-secondary" onclick="app.downloadIcsCalendarFile(${JSON.stringify(reg).replace(
                /"/g,
                "&quot;"
              )}, ${JSON.stringify({
              title: reg.eventTitle,
              date: reg.eventDate,
              location: reg.eventLocation,
              description: 'Registered Event Ticket',
            }).replace(/"/g, "&quot;")})">
                <i class="fa-regular fa-calendar-plus"></i> .ics
              </button>
            </div>
          `;
          })
          .join("");
      } else {
        container.innerHTML = `<p class="modal-sub">No registrations found for <strong>${email}</strong>.</p>`;
      }
    } catch (error) {
      console.error("Error looking up registrations:", error);
      container.innerHTML = `<p class="modal-sub" style="color: var(--accent-amber);">Error fetching tickets.</p>`;
    }
  }

  // Admin Modal
  openAdminModal() {
    // Set default date to 14 days in future
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    document.getElementById("admin-date").value = futureDate;
    this.openModal("admin-modal");
  }

  async handleCreateEventSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("admin-title").value.trim();
    const category = document.getElementById("admin-category").value;
    const status = document.getElementById("admin-status").value;
    const capacity = parseInt(document.getElementById("admin-capacity").value, 10);
    const date = new Date(document.getElementById("admin-date").value).toISOString();
    const time = document.getElementById("admin-time").value.trim();
    const location = document.getElementById("admin-location").value.trim();
    const description = document.getElementById("admin-description").value.trim();
    const coverImage =
      document.getElementById("admin-image").value.trim() ||
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80";

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          status,
          capacity,
          date,
          time,
          location,
          description,
          coverImage,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.closeModal("admin-modal");
        this.showToast("Event created and published successfully!", "success");
        await this.fetchEvents();
      } else {
        this.showToast(result.message || "Failed to create event", "error");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      this.showToast("Network error creating event", "error");
    }
  }

  // Modal controls
  openModal(modalId) {
    document.getElementById(modalId)?.classList.remove("hidden");
  }

  closeModal(modalId) {
    document.getElementById(modalId)?.classList.add("hidden");
  }

  closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach((m) => m.classList.add("hidden"));
  }

  scrollToEvents() {
    document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
  }

  // Auth Management Methods
  async checkAuthStatus() {
    if (!this.token) {
      this.currentUser = null;
      this.updateAuthUI();
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${this.token}`,
        },
      });
      const result = await response.json();

      if (result.success && result.data) {
        this.currentUser = result.data;
      } else {
        // Token invalid or expired
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem("eventhub_token");
      }
    } catch (error) {
      console.error("Auth status verification error:", error);
      this.token = null;
      this.currentUser = null;
      localStorage.removeItem("eventhub_token");
    } finally {
      this.updateAuthUI();
    }
  }

  updateAuthUI() {
    const loggedOutGroup = document.getElementById("nav-auth-logged-out");
    const loggedInGroup = document.getElementById("nav-auth-logged-in");
    const displayName = document.getElementById("user-display-name");

    if (this.currentUser) {
      if (loggedOutGroup) loggedOutGroup.classList.add("hidden");
      if (loggedInGroup) loggedInGroup.classList.remove("hidden");
      if (displayName) displayName.textContent = this.currentUser.name;
    } else {
      if (loggedOutGroup) loggedOutGroup.classList.remove("hidden");
      if (loggedInGroup) loggedInGroup.classList.add("hidden");
    }
  }

  openLoginModal() {
    document.getElementById("login-email").value = "";
    document.getElementById("login-password").value = "";
    this.openModal("login-modal");
  }

  openSignupModal() {
    document.getElementById("signup-name").value = "";
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-phone").value = "";
    document.getElementById("signup-password").value = "";
    this.openModal("signup-modal");
  }

  switchToSignup(e) {
    if (e) e.preventDefault();
    this.closeModal("login-modal");
    this.openSignupModal();
  }

  switchToLogin(e) {
    if (e) e.preventDefault();
    this.closeModal("signup-modal");
    this.openLoginModal();
  }

  async handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const submitBtn = document.getElementById("login-submit-btn");

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Logging in...`;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        this.token = result.data.token;
        this.currentUser = result.data.user;
        localStorage.setItem("eventhub_token", this.token);
        this.updateAuthUI();
        this.closeModal("login-modal");
        this.showToast(`Welcome back, ${this.currentUser.name}!`);
      } else {
        this.showToast(result.message || "Login failed", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.showToast("Network error during login", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Log In`;
    }
  }

  async handleSignupSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const contactNumber = document.getElementById("signup-phone").value.trim();
    const password = document.getElementById("signup-password").value;
    const submitBtn = document.getElementById("signup-submit-btn");

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering...`;

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, contactNumber, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        this.token = result.data.token;
        this.currentUser = result.data.user;
        localStorage.setItem("eventhub_token", this.token);
        this.updateAuthUI();
        this.closeModal("signup-modal");
        this.showToast(`Account created! Welcome to EventHub, ${this.currentUser.name}!`);
      } else {
        this.showToast(result.message || "Signup failed", "error");
      }
    } catch (error) {
      console.error("Signup error:", error);
      this.showToast("Network error during registration", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-user-check"></i> Sign Up`;
    }
  }

  logout() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem("eventhub_token");
    this.updateAuthUI();
    this.showToast("Logged out successfully.");
  }

  showToast(message, type = "info") {
    const toast = document.getElementById("toast-notification");
    const toastMsg = document.getElementById("toast-message");

    toastMsg.textContent = message;
    toast.classList.remove("hidden");

    setTimeout(() => {
      toast.classList.add("hidden");
    }, 4000);
  }
}

// Instantiate App on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new EventHubApp();
});
