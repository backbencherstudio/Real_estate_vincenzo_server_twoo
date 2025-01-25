const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const mongoUri = `mongodb+srv://taskify:sY8hOL3hPep60pLS@cluster0.5jhcp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const dbName = 'taskify'; // Database name
const client = new MongoClient(mongoUri);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow all origins for demo purposes
    methods: ['GET', 'POST'],
  },
});
const users = {};

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
client
  .connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Track online users
const onlineUsers = new Map();

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // Join user and update user list
  socket.on('join', async (username) => {
    users[socket.id] = username;
    // Mark user as online
    onlineUsers.set(username, true);
    console.log(`${username} joined the chat.`);

    // Send existing messages to the newly connected user
    try {
      const db = client.db(dbName);
      const messagesCollection = db.collection('chats');
      const chats = await messagesCollection
        .find()
        .sort({ timestamp: 1 })
        .toArray(); // Fetch messages
      socket.emit('message history', chats); // Send message history to the user

      // Broadcast updated online users list to all clients
      io.emit('online_users', Object.fromEntries(onlineUsers));
    } catch (err) {
      console.error('Error fetching message history:', err);
    }

    // Broadcast updated user list with online status
    io.emit('user list', Object.values(users));
  });

  // Handle incoming messages
  socket.on('message', async ({ recipient, content, sender, timestamp }) => {
    const chatMessage = {
      sender,
      recipient,
      content,
      timestamp,
      read: false,
    };

    try {
      const db = client.db(dbName);
      const messagesCollection = db.collection('chats');
      await messagesCollection.insertOne(chatMessage);
      io.emit('message', chatMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      // Mark user as offline
      onlineUsers.delete(username);
      delete users[socket.id];
      console.log(`${username} disconnected.`);

      // Broadcast updated online users list
      io.emit('online_users', Object.fromEntries(onlineUsers));
      // Broadcast updated user list
      io.emit('user list', Object.values(users));
    }
  });

  // Handle explicit user offline status
  socket.on('user_offline', (username) => {
    onlineUsers.delete(username);
    io.emit('online_users', Object.fromEntries(onlineUsers));
  });

  // Handle explicit user online status
  socket.on('user_online', (username) => {
    onlineUsers.set(username, true);
    io.emit('online_users', Object.fromEntries(onlineUsers));
  });
});

app.get('/chats', async (req, res) => {
  try {
    const db = client.db(dbName);
    const chatsCollection = db.collection('chats');
    const chats = await chatsCollection
      .find()
      .sort({ timestamp: -1 })
      .toArray();
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Update the mark-read endpoint
app.post('/messages/mark-read', async (req, res) => {
  try {
    const { sender, recipient } = req.body;

    const db = client.db(dbName);
    const chatsCollection = db.collection('chats');

    const result = await chatsCollection.updateMany(
      {
        sender: sender,
        recipient: recipient,
        read: false,
      },
      {
        $set: { read: true },
      },
    );

    if (result.modifiedCount > 0) {
      // Notify clients about the updated read status
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

// Update the unread messages endpoint
app.get('/messages/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const db = client.db(dbName);
    const chatsCollection = db.collection('chats');

    // Only get messages where read is explicitly false
    const unreadMessages = await chatsCollection
      .find({
        recipient: userId,
        read: false,
      })
      .toArray();

    const unreadCounts = {};
    unreadMessages.forEach((msg) => {
      if (!msg.read) {
        // Double-check the read status
        unreadCounts[msg.sender] = (unreadCounts[msg.sender] || 0) + 1;
      }
    });

    res.json(unreadCounts);
  } catch (err) {
    console.error('Error fetching unread messages:', err);
    res.status(500).json({ error: 'Error fetching unread messages' });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.get('/', (req, res) => {
  res.send('Hello From Taskify Chat!');
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
