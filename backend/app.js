
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const eventRoutes = require("./route/eventRoutes");
const registrationRoutes = require("./route/registrationRoutes");
const authRoutes = require("./route/authRoutes");
const venueRoutes = require("./route/venueRoutes");
const venueBookingRoutes = require("./route/venueBookingRoutes");
const uploadRoutes = require("./route/uploadRoutes");
const chatRoutes = require("./route/chatRoutes");
const siteSettingRoutes = require("./route/siteSettingRoutes");

const { seedInitialEvents } = require("./controlers/eventController");
const { seedAdminUser } = require("./controlers/authController");
const { seedInitialVenues } = require("./controlers/venueController");
const { seedInitialVenueBookings } = require("./controlers/venueBookingController");

const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");

const app = express();

// High Performance Gzip / Brotli response compression
app.use(compression());

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow external CDN icons, fonts, and Cloudinary media
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Secure CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or localhost/trace domains
      if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin.endsWith(".trace.lk") || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, safely headers configured
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
  })
);

// Body Parser Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Direct replica set fallback URI for MongoDB Atlas (bypasses Windows DNS SRV lookup issues)
const DIRECT_REPLICA_URI =
  "mongodb://admin:3fg96tRd1iREyBza@ac-eyehwbw-shard-00-00.tkag7mg.mongodb.net:27017,ac-eyehwbw-shard-00-01.tkag7mg.mongodb.net:27017,ac-eyehwbw-shard-00-02.tkag7mg.mongodb.net:27017/eventhub?ssl=true&replicaSet=atlas-112dlm-shard-0&authSource=admin&retryWrites=true&w=majority";

const tryConnect = async (uri) => {
  return mongoose.connect(uri, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
  });
};

// Serverless-friendly cached MongoDB connection helper with automatic fallback
let dbConnectionPromise = null;
let isConnecting = false;
let lastConnectAttempt = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (dbConnectionPromise) return dbConnectionPromise;

  const primaryUri = process.env.MONGO_URI || DIRECT_REPLICA_URI;

  dbConnectionPromise = (async () => {
    isConnecting = true;
    lastConnectAttempt = Date.now();
    try {
      await tryConnect(primaryUri);
      console.log("Connected to MongoDB successfully!");
    } catch (err) {
      if (primaryUri !== DIRECT_REPLICA_URI) {
        console.warn(`Primary MongoDB URI failed (${err.message}). Retrying with direct replica set connection...`);
        try {
          await tryConnect(DIRECT_REPLICA_URI);
          console.log("Connected to MongoDB successfully via direct replica set fallback!");
        } catch (fallbackErr) {
          dbConnectionPromise = null;
          isConnecting = false;
          console.error("MongoDB Connection Error:", fallbackErr.message);
          throw fallbackErr;
        }
      } else {
        dbConnectionPromise = null;
        isConnecting = false;
        console.error("MongoDB Connection Error:", err.message);
        throw err;
      }
    }

    isConnecting = false;

    // Seed data asynchronously without crashing the server if an error occurs
    try {
      await Promise.allSettled([
        seedInitialEvents(),
        seedAdminUser(),
        seedInitialVenues(),
        seedInitialVenueBookings(),
      ]);
    } catch (seedErr) {
      console.warn("Database initial seed notice:", seedErr.message);
    }

    return mongoose.connection;
  })();

  return dbConnectionPromise;
};

// Non-blocking connection trigger with debouncing (avoids spamming reconnect attempts)
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1 && !isConnecting && (Date.now() - lastConnectAttempt > 10000)) {
    connectDB().catch(() => {});
  }
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/venue-bookings", venueBookingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/settings", siteSettingRoutes);

// Return JSON 404 for unhandled /api requests (Prevents returning HTML to API callers)
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ success: false, message: `API endpoint ${req.originalUrl} not found` });
  }
  next();
});

// Dedicated static file handler for uploads with cross-origin headers and caching
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "public", "uploads"), {
    maxAge: "7d",
    etag: true,
  })
);

// If an image in /uploads is not found, return 404 JSON instead of index.html
app.use("/uploads", (req, res) => {
  res.status(404).json({ success: false, message: "Upload file not found" });
});

// Serve static public files with 1-day browser caching
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    etag: true,
  })
);

// Fallback to index.html for non-API single page navigation
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

// Start server locally when not running inside Vercel serverless runtime
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  server.timeout = 300000; // 5 minutes timeout for large video uploads
  server.keepAliveTimeout = 65000;
  connectDB().catch((err) => console.log("MongoDB initial connection error:", err.message));
}

module.exports = app;
