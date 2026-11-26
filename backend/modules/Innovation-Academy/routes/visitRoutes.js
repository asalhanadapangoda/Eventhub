import express from 'express';
import {
  createVisitRequest,
  getMyVisitRequests,
  getAllVisitRequests,
  updateVisitStatus,
} from '../controllers/visitController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalAuth, createVisitRequest);
router.get('/my', protect, getMyVisitRequests);
router.get('/', protect, adminOnly, getAllVisitRequests);
router.put('/:id', protect, adminOnly, updateVisitStatus);

export default router;

