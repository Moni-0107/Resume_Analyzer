import express from 'express';
import {
  getResumeAnalysis,
  getATSReportCard,
  getSkillGapReport,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/analysis/:resumeId', protect, getResumeAnalysis);
router.get('/ats/:resumeId', protect, getATSReportCard);
router.get('/skills/gap-analysis', protect, getSkillGapReport);

export default router;
