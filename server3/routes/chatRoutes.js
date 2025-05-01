import express from 'express';
import * as chatController from '../controllers/chatController.js';

const router = express.Router();

router.post('/save-chat', chatController.saveChat);
router.get('/sessions/:user_id', chatController.getSessions);
router.post('/sessions', chatController.createSession);
router.get('/session/:session_id', chatController.getSessionChats);
router.get('/get-chat/:user_id', chatController.getUserChats);
router.get('/debug/cache', chatController.debugCache);
router.post('/debug/clear-cache', chatController.clearCache);
router.delete('/session/:session_id', chatController.deleteSession);

export default router; 