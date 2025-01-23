/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import session from "express-session";
import globalErrorHandler from './app/middleware/globalErrorHandlear';
  
const app: Application = express();

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

app.get('/', async (req, res) => {
  const a = 'server running successfully';
  res.send(a);
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

export default app;
