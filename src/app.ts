/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import session from "express-session";
import globalErrorHandler from './app/middleware/globalErrorHandlear';
import { createServer } from 'http';
import { Server } from 'socket.io';
import MessageModel from './app/Modules/messages/message.module';
const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true,
  },
});

app.use('/uploads', express.static('uploads'));  

app.use(
  session({
    secret: "changeit",                
    resave: false,                     
    saveUninitialized: true,           
    cookie: { maxAge: 2 * 60 * 1000 },
  })
);

// app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.originalUrl === '/api/v1/payment/webhook') {
    next(); 
  } else {
    express.json()(req, res, next);
  }
});



app.use(
  cors({
    origin: ['http://localhost:5173'],  
    credentials: true,
  })
);


app.get('/chats', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const chats = await MessageModel
      .find({
        $or: [
          { sender: email },
          { recipient: email }
        ]
      })
      .sort({ timestamp: -1 })
      .lean();
      
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

app.post('/messages/mark-read', async (req, res) => {
  try {
    const { sender, recipient } = req.body;
    const result = await MessageModel.updateMany(
      {
        sender: sender,
        recipient: recipient,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    if (result.modifiedCount > 0) {
      io.emit('messages_read', { sender, recipient });
    }

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({ error: 'Error marking messages as read' });
  }
});

app.get('/messages/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const unreadMessages = await MessageModel
      .find({
        recipient: userId,
        read: false,
      })
      .lean();

    const unreadCounts: { [key: string]: number } = {};
    unreadMessages.forEach((msg) => {
      if (!msg.read) {
        unreadCounts[msg.sender] = (unreadCounts[msg.sender] || 0) + 1;
      }
    });

    res.json(unreadCounts);
  } catch (err) {
    console.error('Error fetching unread messages:', err);
    res.status(500).json({ error: 'Error fetching unread messages' });
  }
});

app.get('/', async (req, res) => {
  const a = 'server running successfully';
  res.send(a);
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

export { app, httpServer, io };
