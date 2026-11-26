import mongoose from 'mongoose';

const DEFAULT_ATLAS_URI =
  'mongodb+srv://sachininisansala320_db_user:FgQBGnYHv11DZu6q@cluster0.x7ycl3y.mongodb.net/trace_sri_lanka?retryWrites=true&w=majority';

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return cachedPromise;
  }

  const effectiveURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;

  cachedPromise = mongoose
    .connect(effectiveURI, {
      serverSelectionTimeoutMS: 8000,
    })
    .then((conn) => {
      console.log(`[MongoDB] Connected to database: ${conn.connection.host} / ${conn.connection.name}`);
      return conn;
    })
    .catch((err) => {
      cachedPromise = null;
      console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${effectiveURI}: ${err.message}`);
      return null;
    });

  return cachedPromise;
};
