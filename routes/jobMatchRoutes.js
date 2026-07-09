import express from 'express';
import {
  runJobMatchAnalysis,
  getJobMatchHistory,
  getJobMatchDetails,
} from '../controllers/jobMatchController.js';
import { protect } from '../middleware/auth.js';
import { uploadResume } from '../middleware/fileUpload.js';

const router = express.Router();

router.post('/analyze', protect, uploadResume, runJobMatchAnalysis);
router.get('/history', protect, getJobMatchHistory);
router.get('/:id', protect, getJobMatchDetails);

export default router;
