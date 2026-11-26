import express from 'express';
import {
  getPrograms,
  getProgramBySlug,
  createProgram,
  updateProgram,
  deleteProgram,
} from '../controllers/programController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getPrograms).post(protect, adminOnly, createProgram);
router
  .route('/:slug')
  .get(getProgramBySlug)
  .put(protect, adminOnly, updateProgram)
  .delete(protect, adminOnly, deleteProgram);

export default router;

