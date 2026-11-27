import express from 'express';
import mongoose from 'mongoose';
import logger from '../../common/logger.js';

import authRoutes from './routes/authRoutes.js';
import programRoutes from './routes/programRoutes.js';
import workshopRoutes from './routes/workshopRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import visitRoutes from './routes/visitRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import User from './models/User.js';
import Program from './models/Program.js';
import { seedData } from './utils/seeder.js';

const router = express.Router();

let isAcademySeeded = false;

export const seedAcademyIfNeeded = async () => {
  if (isAcademySeeded || mongoose.connection.readyState !== 1) return;
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      const [userCount, programCount] = await Promise.all([
        User.countDocuments(),
        Program.countDocuments(),
      ]);
      if (userCount === 0 || programCount === 0) {
        await seedData();
      }
      isAcademySeeded = true;
    } catch (err) {
      logger.warn({ err: err.message }, '[Academy Seeder Notice]');
    } finally {
      seedingPromise = null;
    }
  })();

  return seedingPromise;
};

router.use(async (req, res, next) => {
  if (!isAcademySeeded && mongoose.connection.readyState === 1) {
    seedAcademyIfNeeded().catch(() => { });
  }
  next();
});

router.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'TRACE Sri Lanka Innovation Academy API (Unified Backend)',
    version: '1.0.0',
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'TRACE Sri Lanka Innovation Academy Backend',
    database: mongoose.connection?.name || 'connecting',
    connected: mongoose.connection?.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

const publicCache = (req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  next();
};

router.use('/auth', authRoutes);
router.use('/programs', publicCache, programRoutes);
router.use('/workshops', publicCache, workshopRoutes);
router.use('/registrations', registrationRoutes);
router.use('/visits', visitRoutes);
router.use('/contact', contactRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

export default router;
