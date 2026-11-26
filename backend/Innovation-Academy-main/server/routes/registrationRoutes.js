import express from 'express';
import {
  registerProgram,
  getMyRegistrations,
  getAllRegistrations,
  updateRegistrationStatus,
  checkProgramAccess,
  deleteRegistration,
} from '../controllers/registrationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, registerProgram);
router.get('/my', protect, getMyRegistrations);
router.get('/check-access/:programSlug', protect, checkProgramAccess);
router.get('/', protect, adminOnly, getAllRegistrations);
router.put('/:id/status', protect, adminOnly, updateRegistrationStatus);
router.delete('/:id', protect, adminOnly, deleteRegistration);

export default router;

