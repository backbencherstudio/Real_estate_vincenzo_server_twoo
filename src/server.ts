/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-inner-declarations */
import cluster from 'cluster';
import os from 'os';
import mongoose from 'mongoose';
import config from './app/config';
import { app, httpServer, io } from './app';
import MessageModel from './app/Modules/messages/message.module';
import MessageService from './app/Modules/messages/message.service';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.error(`Worker ${worker.process.pid} exited. Restarting...`);
    cluster.fork();
  });
} else {
  async function main() {
    try {
      await mongoose.connect(config.database_url as string);
      
      const messageService = new MessageService(io, MessageModel);

      io.on('connection', (socket) => {

        socket.on('join', (username) => messageService.handleJoin(socket, username));
        socket.on('message', (messageData) => messageService.handleMessage(messageData));
        socket.on('delete_message', (messageId) => messageService.handleDeleteMessage(messageId));
        socket.on('disconnect', () => messageService.handleDisconnect(socket));
        socket.on('user_offline', (username) => messageService.handleUserStatus(username, false));
        socket.on('user_online', (username) => messageService.handleUserStatus(username, true));

        socket.on('hide_message_for_sender', async ({ messageId, userId }) => {
          try {
            const result = await MessageModel.updateOne(
              { _id: messageId },
              { $addToSet: { hiddenFor: userId } }
            );
            
            if (result.modifiedCount > 0) {
              socket.emit('message_hidden', { messageId, userId });
            }
          } catch (err) {
            console.error('Error hiding message:', err);
          }
        });
      });

      httpServer.listen(config.port, () => {
        console.log(`Worker ${process.pid} is running on PORT === ${config.port}`);
      });
    } catch (error) {
      console.error(`Worker ${process.pid} failed to start:`, error);
    }
  }

  main();
}

export default app;
