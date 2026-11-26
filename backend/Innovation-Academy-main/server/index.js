import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import programRoutes from './routes/programRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Models for auto-seeding check
import User from './models/User.js';
import Program from './models/Program.js';
import Notification from './models/Notification.js';
import ContactMessage from './models/ContactMessage.js';
import { seedData } from './utils/seeder.js';

dotenv.config();

const app = express();

// Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder (Safe for Vercel Serverless read-only filesystem)
const uploadsDir = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.resolve('uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (fsErr) {
  console.warn('[FS Notice] Uploads directory skipped in read-only environment:', fsErr.message);
}
app.use('/uploads', express.static(uploadsDir));

// API Health Check & Root Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'TRACE Sri Lanka API is active and operational.',
    organization: 'Innovation',
    project: 'InnovationA',
    frontend: 'http://localhost:5174',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      programs: '/api/programs',
      workshops: '/api/workshops',
      registrations: '/api/registrations',
      visits: '/api/visits',
      contact: '/api/contact',
      users: '/api/users',
    },
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    organization: 'Innovation',
    project: 'InnovationA',
    service: 'TRACE Sri Lanka Innovation Academy Backend API',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    organization: 'Innovation',
    project: 'InnovationA',
    service: 'TRACE Sri Lanka Innovation Academy Backend',
    timestamp: new Date().toISOString(),
  });
});

let isSeeded = false;

// Serverless MongoDB auto-connect & auto-seeding middleware
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (e) {
      console.warn('[Serverless DB connect warning]', e.message);
    }
  }

  // Auto-seed if database is empty on Vercel
  if (!isSeeded && mongoose.connection.readyState === 1) {
    try {
      const userCount = await User.countDocuments();
      const programCount = await Program.countDocuments();
      if (userCount === 0 || programCount === 0) {
        console.log('[TRACE System] Empty Atlas database detected. Auto-seeding initial TRACE programs, workshops and admin user...');
        await seedData();
        console.log('[TRACE System] Seeding completed successfully!');
      }
      isSeeded = true;
    } catch (seedErr) {
      console.warn('[TRACE Seeder Notice]', seedErr.message);
    }
  }

  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Connect to Database in background and start Express server immediately
const startServer = () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 TRACE Sri Lanka API Server running on port ${PORT}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}`);
      console.log(`🔒 Organization: Innovation | Project: InnovationA`);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n⚠️  [Port Conflict] Port ${PORT} is already in use by another running server instance.`);
        console.error(`👉 Your server is already active and running at http://localhost:${PORT}`);
        console.error(`👉 If you wish to restart it, stop the running process or run:\n   npx kill-port ${PORT}\n`);
        process.exit(0);
      } else {
        console.error('Server error:', err);
      }
    });

    // Asynchronously connect to MongoDB Atlas / local MongoDB
    connectDB()
      .then(async (conn) => {
        if (conn) {
          const userCount = await User.countDocuments();
          const programCount = await Program.countDocuments();
          if (userCount === 0 || programCount === 0) {
            console.log(
              '[TRACE System] Empty database detected. Auto-seeding initial TRACE programs and users...'
            );
            await seedData();
          }

          // Clean up legacy demo notifications so only real notifications remain
          await Notification.deleteMany({
            $or: [
              {
                title: {
                  $in: [
                    'Program Registration Confirmed',
                    'Workshop Reminder: Design Thinking & Grand Challenges',
                    'Bay 05 Lab Access Hours Extended',
                  ],
                },
              },
              {
                title: {
                  $regex: /Program Registration Confirmed|Workshop Reminder|Bay 05 Lab Access Hours Extended/i,
                },
              },
            ],
          });

          // Consolidate duplicate ContactMessages by participant email into single unified threads
          try {
            const allContacts = await ContactMessage.find({}).sort({ createdAt: 1 });
            const emailGroups = new Map();
            for (const c of allContacts) {
              const emailKey = (c.email || '').toLowerCase().trim();
              if (!emailKey) continue;
              if (!emailGroups.has(emailKey)) emailGroups.set(emailKey, []);
              emailGroups.get(emailKey).push(c);
            }
            for (const [email, docs] of emailGroups.entries()) {
              if (docs.length > 1) {
                const primary = docs[0];
                let combinedConv = Array.isArray(primary.conversation) ? [...primary.conversation] : [];
                if (combinedConv.length === 0 && primary.message) {
                  combinedConv.push({
                    sender: 'participant',
                    senderName: primary.name,
                    message: primary.message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim(),
                    createdAt: primary.createdAt,
                  });
                  if (primary.replyNotes) {
                    combinedConv.push({
                      sender: 'admin',
                      senderName: 'TRACE Secretariat',
                      message: primary.replyNotes,
                      createdAt: primary.repliedAt || primary.createdAt,
                    });
                  }
                }
                for (let i = 1; i < docs.length; i++) {
                  const secondary = docs[i];
                  if (Array.isArray(secondary.conversation) && secondary.conversation.length > 0) {
                    combinedConv.push(...secondary.conversation);
                  } else {
                    if (secondary.message) {
                      combinedConv.push({
                        sender: 'participant',
                        senderName: secondary.name,
                        message: secondary.message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim(),
                        createdAt: secondary.createdAt,
                      });
                    }
                    if (secondary.replyNotes) {
                      combinedConv.push({
                        sender: 'admin',
                        senderName: 'TRACE Secretariat',
                        message: secondary.replyNotes,
                        createdAt: secondary.repliedAt || secondary.createdAt,
                      });
                    }
                  }
                  if (secondary.status === 'Unread') primary.status = 'Unread';
                  if (secondary.programOfInterest) primary.programOfInterest = secondary.programOfInterest;
                  await ContactMessage.findByIdAndDelete(secondary._id);
                }
                primary.conversation = combinedConv.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const last = primary.conversation[primary.conversation.length - 1];
                if (last) primary.message = last.message;
                await primary.save();
              }
            }
          } catch (mergeErr) {
            console.warn('[Contact Merge Notice]', mergeErr.message);
          }
        }
      })
      .catch((err) => {
        console.warn('[MongoDB Notice]', err.message);
      });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

// Only call app.listen in local / non-serverless environments
if (!process.env.VERCEL) {
  startServer();
} else {
  // Pre-initialize MongoDB connection in serverless container
  connectDB().catch((err) => console.warn('[MongoDB Serverless Notice]', err.message));
}

export default app;

