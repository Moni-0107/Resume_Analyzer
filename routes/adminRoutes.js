import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  deleteUserByAdmin,
  getSystemLogs,
  getAIPrompts,
  updateAIPrompts,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes here require user login and administrator clearance
router.get('/stats', protect, admin, getAdminStats);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUserByAdmin);
router.get('/logs', protect, admin, getSystemLogs);
router.get('/prompts', protect, admin, getAIPrompts);
router.put('/prompts', protect, admin, updateAIPrompts);

export default router;
