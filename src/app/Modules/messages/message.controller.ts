import { Request, Response } from 'express';
import MessageService from './message.service';
import MessageModel from './message.module';

class MessageController {
  private messageService: MessageService;

  constructor(messageService: MessageService) {
    this.messageService = messageService;
  }

  async getAllChats(req: Request, res: Response) {
    try {
      const chats = await MessageModel
        .find()
        .sort({ timestamp: -1 })
        .lean();
      res.json(chats);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching messages' });
    }
  }

  async markMessagesAsRead(req: Request, res: Response) {
    try {
      const { sender, recipient } = req.body;
      const modifiedCount = await this.messageService.markMessagesAsRead(sender, recipient);
      
      res.json({
        success: true,
        modifiedCount,
      });
    } catch (err) {
      res.status(500).json({ error: 'Error marking messages as read' });
    }
  }

  async getUnreadMessages(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const unreadCounts = await this.messageService.getUnreadMessages(userId);
      res.json(unreadCounts);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching unread messages' });
    }
  }
}

export default MessageController;
