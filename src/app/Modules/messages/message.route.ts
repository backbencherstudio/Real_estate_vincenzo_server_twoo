import express from 'express';
import MessageController from './message.controller';

const router = express.Router();

const messageRoutes = (messageController: MessageController) => {
  router.get('/chats', async (req, res) => {
    await messageController.getAllChats(req, res);
  });
  router.post('/messages/mark-read', async (req, res) => {
    await messageController.markMessagesAsRead(req, res);
  });
  router.get('/messages/unread/:userId', async (req, res) => {
    await messageController.getUnreadMessages(req, res);
  });

  return router;
};

export default messageRoutes; 