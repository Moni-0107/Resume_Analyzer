import express from 'express';
import {
  uploadAndParseResume,
  getMyResume,
  deleteResume,
  previewResume,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/auth.js';
import { uploadResume } from '../middleware/fileUpload.js';

const router = express.Router();

// All resume actions require protection
router.post('/upload', protect, uploadResume, uploadAndParseResume);
router.get('/my-resume', protect, getMyResume);
router.delete('/:id', protect, deleteResume);
router.get('/:id/preview', protect, previewResume);

export default router;
