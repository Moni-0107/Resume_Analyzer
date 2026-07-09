import express from 'express';
import {
  sendMessageToMentor,
  getChatsList,
  getChatDetails,
  deleteChat,
} from '../controllers/mentorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, sendMessageToMentor);
router.get('/chats', protect, getChatsList);
router.get('/chats/:id', protect, getChatDetails);
router.delete('/chats/:id', protect, deleteChat);

export default router;
