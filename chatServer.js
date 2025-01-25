const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const mongoUri = `mongodb+srv://taskify:sY8hOL3hPep60pLS@cluster0.5jhcp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const dbName = 'taskify';
const client = new MongoClient(mongoUri);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
const users = {};

app.use(cors());
app.use(express.json());

client
  .connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('MongoDB connection error:', err));

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  socket.on('join', async (username) => {
    users[socket.id] = username;
    onlineUsers.set(username, true);
    console.log(`${username} joined the chat.`);

    try {
      const db = client.db(dbName);
      const messagesCollection = db.collection('chats');
      const chats = await messagesCollection
        .find()
        .sort({ timestamp: 1 })
        .toArray();
      socket.emit('message history', chats);

      io.emit('online_users', Object.fromEntries(onlineUsers));
    } catch (err) {
      console.error('Error fetching message history:', err);
    }

    io.emit('user list', Object.values(users));
  });

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

  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      onlineUsers.delete(username);
      delete users[socket.id];
      console.log(`${username} disconnected.`);

      io.emit('online_users', Object.fromEntries(onlineUsers));
      io.emit('user list', Object.values(users));
    }
  });

  socket.on('user_offline', (username) => {
    onlineUsers.delete(username);
    io.emit('online_users', Object.fromEntries(onlineUsers));
  });

  socket.on('user_online', (username) => {
    onlineUsers.set(username, true);
    io.emit('online_users', Object.fromEntries(onlineUsers));
  });

  socket.on('delete_message', async (messageId) => {
    try {
      const db = client.db(dbName);
      const messagesCollection = db.collection('chats');

      // Convert string ID to ObjectId
      const result = await messagesCollection.deleteOne({
        _id: new ObjectId(messageId),
      });

      if (result.deletedCount > 0) {
        // Broadcast the deletion to all connected clients
        io.emit('message_deleted', messageId);
        console.log(`Message ${messageId} deleted successfully`);
      } else {
        console.log(`No message found with ID ${messageId}`);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
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

    const db = client.db(dbName);
    const chatsCollection = db.collection('chats');

    const unreadMessages = await chatsCollection
      .find({
        recipient: userId,
        read: false,
      })
      .toArray();

    const unreadCounts = {};
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

const PORT = process.env.PORT || 4000;
app.get('/', (req, res) => {
  res.send('Hello From Taskify Chat!');
});
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
