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
  socket.on('message', async ({ recipient, message, sender }) => {
    const chatMessage = {
      sender: sender,
      recipient: recipient,
      content: message,
      timestamp: new Date(),
    };
    console.log(chatMessage);

    try {
      const db = client.db(dbName);
      const messagesCollection = db.collection('chats');
      await messagesCollection.insertOne(chatMessage); // Save message to MongoDB

      // Emit the message to all clients
      io.emit('message', chatMessage); // Send the message to all clients

      // Optionally, send to specific recipient
      const recipientSocketId = Object.keys(users).find(
        (key) => users[key] === recipient,
      );
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('message', chatMessage);
      }
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

// Start the server
const PORT = process.env.PORT || 4000;
app.get('/', (req, res) => {
  res.send('Hello From Taskify Chat!');
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
