import { Document } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  recipient: string;
  content: string;
  timestamp: Date;
  read: boolean;
  hiddenFor?: string[];
}

export interface IOnlineUsers {
  [key: string]: boolean;
}

export interface IChatMessage {
  recipient: string;
  content: string;
  sender: string;
  timestamp: Date;
}
