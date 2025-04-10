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
    subject: 'Set your OTP within 2 minutes', 
    text: '', 
    html : `<div style="max-width: 500px; margin: 0 auto; padding: 25px; font-family: 'Arial', sans-serif; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1); border-top: 5px solid #3366cc; background: linear-gradient(to bottom, #ffffff, #f9f9f9);">
  <div style="text-align: center;">
    <h2 style="color: #3366cc; margin: 0 0 20px; font-size: 22px;">Your Verification Code</h2>
    <p style="color: #555; font-size: 16px; margin-bottom: 20px;">Please use the OTP code below to verify your account:</p>
    <div style="background-color: #f0f5ff; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #3366cc;">
      <p style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #3366cc; margin: 0;">${otp}</p>
    </div>
    <p style="color: #777; font-size: 14px; margin-top: 20px;">This code will expire in <span style="font-weight: bold; color: #dd5555;">2 minutes</span></p>
    <p style="color: #777; font-size: 14px; margin-top: 25px;">If you don't need this code, please ignore this email.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 13px; margin: 0;">© 2025 RentPadHomes. All rights reserved.</p>
    </div>
  </div>
</div>` ,
  });
};
