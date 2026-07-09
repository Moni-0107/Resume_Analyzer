import express from 'express';
import {
  startMockSession,
  respondToMockQuestion,
  getMockHistoryList,
} from '../controllers/mockInterviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', protect, startMockSession);
router.post('/respond', protect, respondToMockQuestion);
router.get('/history', protect, getMockHistoryList);

export default router;
