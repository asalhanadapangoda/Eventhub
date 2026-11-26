import express from 'express';
import {
  getWorkshops,
  getWorkshopBySlug,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
} from '../controllers/workshopController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getWorkshops).post(protect, adminOnly, createWorkshop);
router
  .route('/:slug')
  .get(optionalAuth, getWorkshopBySlug)
  .put(protect, adminOnly, updateWorkshop)
  .delete(protect, adminOnly, deleteWorkshop);

export default router;

