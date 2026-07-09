import express from 'express';
import {
  buildRoadmap,
  getMyRoadmap,
  toggleTaskState,
} from '../controllers/roadmapController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, buildRoadmap);
router.get('/my-roadmap', protect, getMyRoadmap);
router.put('/tasks/:id', protect, toggleTaskState);

export default router;
