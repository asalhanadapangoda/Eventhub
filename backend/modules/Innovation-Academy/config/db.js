import mongoose from 'mongoose';

let cachedPromise = null;

export const connectDB = async () => {
  // Reuse the unified Event & Space MongoDB connection (same database)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  const effectiveURI = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!effectiveURI) {
    console.warn('[Academy MongoDB] Waiting for unified backend MONGO_URI connection.');
    return null;
  }

  cachedPromise = mongoose
    .connect(effectiveURI, {
      serverSelectionTimeoutMS: 15000,
    })
    .then((conn) => {
      console.log(`[MongoDB] Academy connected to unified database: ${conn.connection.host} / ${conn.connection.name}`);
      return conn;
    })
    .catch((err) => {
      cachedPromise = null;
      console.warn(`[MongoDB Warning] Could not connect to unified MongoDB: ${err.message}`);
      return null;
    });

  return cachedPromise;
};
