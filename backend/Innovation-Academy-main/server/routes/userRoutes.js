import express from 'express';
import {
  getAdminStats,
  getParticipantOverview,
  getNotifications,
  markNotificationRead,
  getAllParticipants,
  deleteParticipant,
  updateParticipantRole,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin-stats', protect, adminOnly, getAdminStats);
router.get('/admin/stats', protect, adminOnly, getAdminStats);
router.get('/participants', protect, adminOnly, getAllParticipants);
router.put('/participants/:id/role', protect, adminOnly, updateParticipantRole);
router.delete('/participants/:id', protect, adminOnly, deleteParticipant);
router.get('/participant-overview', protect, getParticipantOverview);
router.get('/participant/overview', protect, getParticipantOverview);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

export default router;

