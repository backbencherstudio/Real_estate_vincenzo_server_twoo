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
import Stripe from 'stripe';
import config from './app/config';
const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'https://rentpadhomes.com', 'http://rentpadhomes.com'],
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
    origin: ['http://localhost:5173', 'https://rentpadhomes.com', 'http://rentpadhomes.com', 'https://rentpadhomes.com'],  
    credentials: true,
  })
);

const stripe = new Stripe(config.stripe_test_secret_key as string);

app.post('/create-customer', async (req, res) => {
  try {
    const { name, email } = req.body;
    const customer = await stripe.customers.create({ name, email });
    res.json({ customerId: customer.id });
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

// Step 2: Create Bank Account Token
app.post('/create-bank-token', async (req, res) => {
  try {
    const { account_number, routing_number, account_holder_name } = req.body;

    const bankToken = await stripe.tokens.create({
      bank_account: {
        country: 'US',
        currency: 'usd',
        account_holder_name,
        account_holder_type: 'individual',
        routing_number,
        account_number,
      },
    });

    res.json({ bankToken: bankToken.id });
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

// Step 3: Attach Bank Account to Customer
app.post('/attach-bank-account', async (req, res) => {
  try {
    const { customerId, bankToken } = req.body;
    const bankAccount = await stripe.customers.createSource(customerId, { source: bankToken });
    res.json(bankAccount);
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

// Step 4: Verify Bank Account (Micro-deposit Verification)
app.post('/verify-bank-account', async (req, res) => {
  try {
    const { customerId, bankAccountId, amounts } = req.body;
    
    const verification = await stripe.customers.verifySource(customerId, bankAccountId, {
      amounts,
    });

    res.json({ verification });
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

// Step 5: Charge ACH Payment (Rent Payment)
app.post('/pay-rent', async (req, res) => {
  console.log(req.body);
  
  try {
    const { customerId, amount, bankAccountId } = req.body;

    const charge = await stripe.charges.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      customer: customerId,
      source: bankAccountId,
      description: 'Monthly Rent Payment',
      // transfer_data: { destination: "acct_1Qj3DaLdWMYlebBQ" }, // Admin receives the rent
      metadata: {
        rent_month: amount,
        user_id: "123456",
        payment_id: "789987899"
      }
    });

    console.log(charge);
    

    res.json(charge);
  } catch (error : any ) {
    res.status(500).json({ error: error.message });
  }
});





app.use("/api/v1", router);


app.get('/chats', async (req, res) => {
  try {
    const chats = await MessageModel
      .find()
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


app.use(globalErrorHandler);

export { app, httpServer, io };
