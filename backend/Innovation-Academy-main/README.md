# TRACE Sri Lanka — Full Stack Web Platform (MERN Stack)
### TRACE Innovation Academy | Powered by TRACE Expert City, Maradana

A complete, production-grade corporate web platform for **TRACE Sri Lanka**, developed using the **MERN Stack** (MongoDB with Mongoose, Express.js, React.js with Tailwind CSS, and Node.js) following the official **Google Stitch** design system.

---

## 🏛️ Project & Organization Credentials
- **Organization Name:** `Innovation`
- **Project Name:** `InnovationA`
- **Cluster Target:** MongoDB Atlas / Local MongoDB
- **Lead Secretariat:** TRACE Expert City, Bay 05, FoodMarket Complex, Maradana, Colombo 10, Sri Lanka

---

## 🚀 Key Architectural & Business Logic Highlights

1. **Two Flagship Programs:**
   - **Program 01:** *Innovation & Design Thinking Masterclass* (`/programs/program-01`)
   - **Program 02:** *Pre-Incubation Program on Startup Innovation* (`/programs/program-02`)
2. **Automatic Workshop Access (No Separate Registration):**
   - Each workshop belongs strictly to one parent program.
   - When a participant registers for a program, they **automatically gain access to all workshops under that program**.
   - No separate workshop forms, fees, or registration records exist.
   - Enrolled participants in Program 01 access Program 01 workshops; Program 02 participants access Program 02 workshops. Access is locked for unenrolled programs with clear prompt to join the parent track.
   - If administrators schedule a new workshop under a program, it **automatically surfaces in real-time** on the dashboards of all enrolled cohort members!
3. **Program Registration System:**
   - Unique reference numbers generated (e.g., `REG-TRC-2026-XXXX`).
   - Duplicate registration prevention enforced via unique Compound Index `(userId + programId)`.
   - Transactional email dispatch (with console mock logger when SMTP is unconfigured).
4. **Independent Industry Visits System:**
   - Separate dedicated page (`/industry-visits`).
   - Completely independent from program registration (participants do not need to join either program to request a campus visit).
   - Generates visit reference numbers (e.g., `VIS-TRC-XXX`) with review & confirmation workflow.
5. **Dual Dashboards:**
   - **Participant Dashboard:** Welcome intelligence, enrolled programs, unlocked workshops with join links, visit requests, notifications, and profile manager.
   - **Admin Operations Intelligence Portal:** Modeled directly after the Google Stitch `code.html` design with KPI metrics, cohorts capacity gauge, admissions queue, workshop agenda dispatcher, secretariat fast-actions, audit log, candidate evaluation modal, and full CRUD managers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Google Material Symbols |
| **Backend** | Node.js (v20+), Express.js (ES Modules), Multer, JWT, Bcrypt.js, CORS |
| **Database** | MongoDB with Mongoose ODM (includes instant resilient in-memory fallback) |
| **Design System** | Google Stitch: "Executive Innovation" Navy (`#0B192C`), Sapphire Cyan (`#006398`), and Slate surfaces |

---

## 📂 Project Directory Structure

```text
d:\Innovation Acadamic web\
├── client/                                # React.js + Vite Frontend
│   ├── public/                            # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                    # Navbar, Footer, ProtectedRoute
│   │   │   ├── home/                      # Hero, About, Programs, Workshops, Contact
│   │   │   ├── participant/               # ParticipantLayout & Navigation
│   │   │   └── admin/                     # AdminLayout & Navigation
│   │   ├── context/                       # AuthContext & State Management
│   │   ├── pages/
│   │   │   ├── HomePage.jsx               # Ordered: Header, Hero, About, Programs, Workshops, Contact, Footer
│   │   │   ├── ProgramsPage.jsx           # Catalog of both flagship programs
│   │   │   ├── ProgramDetailPage.jsx      # /programs/:slug (Overview, Objectives, Activities, Info, Workshops, Registration)
│   │   │   ├── WorkshopDetailPage.jsx     # /programs/:programSlug/workshops/:workshopSlug
│   │   │   ├── IndustryVisitsPage.jsx     # /industry-visits (Separate page with application form)
│   │   │   ├── LoginPage.jsx              # Authentication with one-click demo credentials
│   │   │   ├── RegisterPage.jsx           # User registration
│   │   │   ├── participant/               # Participant Dashboard (Overview, My Programs, My Workshops, Visits, Profile, Notifications)
│   │   │   └── admin/                     # Admin Dashboard (Intelligence, Programs, Workshops, Registrations, Visits, Contacts, Settings)
│   │   ├── services/
│   │   │   └── api.js                     # Unified Axios API service with Bearer token interceptor
│   │   ├── App.jsx                        # Complete client routing
│   │   ├── main.jsx                       # React entry point
│   │   └── index.css                      # Tailwind & Google Fonts imports
│   ├── tailwind.config.js                 # Stitch design color tokens & typography scales
│   ├── vite.config.js                     # Vite build & API proxy (Port 5001)
│   └── package.json
├── server/                                # Node.js + Express + Mongoose Backend
│   ├── config/
│   │   ├── db.js                          # MongoDB connection with graceful resilience
│   │   └── mockStore.js                   # In-memory reactive store initialized with seed data
│   ├── controllers/                       # Auth, Programs, Workshops, Registrations, Visits, Contact, Users
│   ├── middleware/                        # Auth (JWT verification & admin guards), ErrorHandler, Multer Upload
│   ├── models/                            # Mongoose Schemas (User, Program, Workshop, ProgramRegistration, VisitRequest, ContactMessage, Notification)
│   ├── routes/                            # Modular API endpoints
│   ├── utils/
│   │   ├── emailService.js                # Transactional email service
│   │   └── seeder.js                      # Database seeder with production-grade data
│   ├── uploads/                           # Local file uploads directory
│   ├── test-workflows.js                  # Automated 13-case test suite verifying all business rules
│   ├── .env                               # Active configuration
│   ├── .env.example                       # Environment template
│   ├── index.js                           # Express entry point
│   └── package.json
├── stitch_source/                         # Extracted Google Stitch design artifacts (DESIGN.md, code.html, screen.png)
├── package.json                           # Workspace root scripts
└── README.md
```

---

## ⚡ Quick Start & Setup Instructions

### 1. Prerequisites
- **Node.js** v18+ or v20+
- **MongoDB** (Local instance or MongoDB Atlas connection string)

### 2. Configure Environment Variables
Inside `server/.env`:
```env
PORT=5001
NODE_ENV=development

# MongoDB Atlas or Local MongoDB Connection String
# For your "InnovationA" project in Atlas, paste your connection URI:
MONGODB_URI=mongodb://127.0.0.1:27017/trace_sri_lanka

# Project Metadata
ORGANIZATION_NAME=Innovation
PROJECT_NAME=InnovationA

# JWT Secret
JWT_SECRET=trace_expert_city_jwt_secret_2025_innovation_a

# Optional Cloudinary & SMTP credentials
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

### 3. Run the Backend API Server
```bash
cd server
npm start
```
*The server will start on `http://localhost:5001`.*

### 4. Run the Frontend Development Server
In a separate terminal:
```bash
cd client
npm run dev
```
*The React application will open on `http://localhost:5173`.*

---

## 🧪 Run Automated Verification Tests

The platform includes an automated end-to-end test suite (`server/test-workflows.js`) verifying all 13 critical business logic requirements:
```bash
cd server
node test-workflows.js
```

### Verified Test Cases:
1. `GET /api/health` — Confirms cluster operational status and project metadata (`InnovationA`).
2. `GET /api/programs` — Confirms exactly TWO flagship programs.
3. `POST /api/auth/register` — Tests participant account registration.
4. `GET /api/workshops/:slug` — Verifies workshop access is **locked** before program enrollment.
5. `POST /api/registrations` — Enrolls participant in Program 01 and generates reference number (`REG-TRC-2026-XXXX`).
6. `POST /api/registrations` (Duplicate) — Verifies duplicate enrollment prevention.
7. `GET /api/workshops/:slug` (Program 01) — Verifies **automatic workshop access unlocked** without separate workshop registration.
8. `GET /api/workshops/:slug` (Program 02) — Verifies access remains **strictly locked** for workshops under unenrolled programs.
9. `POST /api/visits` — Verifies independent Industry Visit request submission and reference number generation (`VIS-TRC-XXX`).
10. `POST /api/contact` — Verifies homepage contact form submission and database persistence.
11. `POST /api/auth/login` — Verifies Admin login and JWT token authorization.
12. `GET /api/registrations` (Admin) — Verifies Admin can inspect and triage candidate registrations.
13. `GET /api/visits` (Admin) — Verifies Admin can review and confirm delegation visit schedules.

---

## 🔑 Default Credentials for Testing

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Administrator** | `admin@trace.lk` | `admin123` | Operations Intelligence & Admin Portal (`/admin`) |
| **Participant** | `kavindu@eng.mrt.ac.lk` | `user123` | Enrolled in Program 01 (`/participant`) |
| **Participant** | `nimna@heliostech.lk` | `user123` | Enrolled in Program 02 (`/participant`) |

*(One-click demo login buttons are also provided on the `/login` screen).*

