import mongoose from 'mongoose';
import { IMessage } from './message.interface';

const messageSchema = new mongoose.Schema<IMessage>({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  hiddenFor: [{ type: String }]
});

const MessageModel = mongoose.model<IMessage>('Message', messageSchema);

export default MessageModel;
