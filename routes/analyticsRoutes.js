import express from 'express';
import { getAnalyticsDashboard } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getAnalyticsDashboard);

export default router;
