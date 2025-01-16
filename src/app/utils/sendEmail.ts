import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    // port: 587, 
    port: 465, 
    secure: true,
    auth: {
      user: config.sender_email ,
      pass: config.email_pass , 
    },
  });

  await transporter.sendMail({
    from: config.sender_email,
    to, 
    subject: 'Set your OTP withen 2m', 
    text: '', 
    html : `<div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
        <p>Your OTP code is:</p>
        <p style="font-size: 24px; font-weight: bold; color: blue;">${otp}</p>
        <p>Please use this code within 2 minutes to reset your password.</p>
      </div>` ,
  });
};
