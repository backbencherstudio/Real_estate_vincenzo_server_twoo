/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmailToUser = async (to: string[], sub: string, message: string, file : any) => {

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    secure: true, 
    auth: {
      user: config.sender_email,
      pass: config.email_pass ,  
    },
  });
  
  const recipientEmails = to.join(',');
  
  await transporter.sendMail({
    from: config.sender_email,
    to: recipientEmails,
    subject: sub,
    text: '', 
    html: message,
    attachments: file ? [{ 
      filename: file.originalname,
      path: file.path
    }] : [],
  });

};
