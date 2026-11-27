import mongoose from 'mongoose';
import logger from '../../../common/logger.js';

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
    logger.warn('[Academy MongoDB] Waiting for unified backend MONGO_URI connection.');
    return null;
  }

  cachedPromise = mongoose
    .connect(effectiveURI, {
      serverSelectionTimeoutMS: 15000,
    })
    .then((conn) => {
      logger.info(
        { host: conn.connection.host, db: conn.connection.name },
        '[MongoDB] Academy connected to unified database'
      );
      return conn;
    })
    .catch((err) => {
      cachedPromise = null;
      logger.warn({ err: err.message }, '[MongoDB Warning] Could not connect to unified MongoDB');
      return null;
    });

  return cachedPromise;
};
