/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import config from '../config';

export const reminderEmailNotificationForDuePayment = async (to: string[]) => {

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    secure: true, 
    auth: {
      user: config.sender_email,
        pass: config.email_pass, 
    },
  });
  
  const recipientEmails = to.join(',');
  
  await transporter.sendMail({
    from: config.sender_email,
    to: recipientEmails,
    subject: "Friendly Reminder: Rent Payment Due – Avoid Late Fees",
    text: '', 
    html: `
   <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background-color: #0052cc; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">RentPadHomes</h1>
  </div>
  
  <!-- Content Area -->
  <div style="padding: 25px;">
    <p style="font-size: 16px; line-height: 1.5;">Dear Valued Tenant,</p>
    
    <div style="background-color: #f8f9fa; border-left: 4px solid #0052cc; padding: 15px; margin: 15px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: bold;">This is a friendly reminder that your rent payment for this month is still pending.</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.5;">Please ensure your payment is submitted as soon as possible to avoid late fees. As per our agreement, delayed payments will incur additional charges on top of the monthly rent amount.</p>
    
    <div style="background-color: #e8f4fd; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; font-weight: bold; color: #0052cc;">Please submit your payment by the 5th of this month</p>
    </div>
    
    <p style="font-size: 16px; line-height: 1.5;">Thank you for your prompt attention to this matter. We appreciate having you as our tenant!</p>
    
    <p style="margin-top: 20px;">Warm Regards,<br>
    <strong>RentPadHomes Team</strong></p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #666666;">
    <p style="margin: 0;">
      If you have any questions, feel free to <a href="mailto:rentpadhomesteam@gmail.com" style="color: #0052cc; text-decoration: none; font-weight: bold;">contact us</a>.
    </p>
    <p style="margin: 10px 0 0; font-size: 13px; color: #888888;">&copy; 2025 RentPadHomes Team. All rights reserved.</p>
  </div>
</div>
    ` ,
  });

};