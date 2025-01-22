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

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // Join user and update user list
  socket.on('join', async (username) => {
    users[socket.id] = username;
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
    } catch (err) {
      console.error('Error fetching message history:', err);
    }

    // Broadcast updated user list
    io.emit('user list', Object.values(users));
  });

  // Handle incoming messages
  socket.on('message', async ({ to, message, user }) => {
    const chatMessage = {
      sender: user,
      recipient: to,
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
        (key) => users[key] === to,
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
    delete users[socket.id]; // Remove user from the list
    console.log(`${username} disconnected.`);
    // Broadcast updated user list
    io.emit('user list', Object.values(users));
  });
});

app.get('/chats', async (req, res) => {
  try {
    const db = client.db(dbName);
    const chatsCollection = db.collection('chats');
    const chats = await chatsCollection
      .find()
      .sort({ timestamp: -1 })
      .toArray(); // Fetch messages in reverse order
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
