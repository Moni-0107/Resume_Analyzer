import express from 'express';
import {
  generateQuestions,
  startInterviewSession,
  respondToQuestion,
  getInterviewHistory,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, generateQuestions);
router.post('/session/start', protect, startInterviewSession);
router.post('/session/respond', protect, respondToQuestion);
router.get('/history', protect, getInterviewHistory);

export default router;
