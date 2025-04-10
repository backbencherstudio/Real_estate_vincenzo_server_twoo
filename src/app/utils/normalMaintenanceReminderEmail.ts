/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import config from '../config';

export const normalMaintenanceReminderEmail = async (to: string) => {

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    secure: true, 
    auth: {
      user: config.sender_email,
        pass: config.email_pass, 
    },
  });
  
  
  await transporter.sendMail({
    from: config.sender_email,
    to,
    subject: "Maintenance Request",
    text: '',
    html: `
   <div style="font-family: 'Arial', sans-serif; max-width: 500px; margin: 0 auto; background-color: #ffffff; color: #333333; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; border-top: 5px solid #3366cc;">
    <div style="background-color: #f0f5ff; padding: 15px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; color: #3366cc;">
            Maintenance Request Reminder
        </h1>
    </div>
    
    <div style="padding: 25px; text-align: center;">
        <h2 style="font-size: 18px; margin-bottom: 15px; color: #555555;">
            Your Attention Is Requested
        </h2>
                
        <p style="font-size: 15px; line-height: 1.6; color: #555555; margin-bottom: 20px; text-align: left;">
            We wanted to remind you about a pending maintenance request at your property. Please review the details and take appropriate action at your earliest convenience.
        </p>
        
        <a href="https://rentpadhomes.com/owner/maintenance" style="display: inline-block; background-color: #3366cc; color: white; padding: 10px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-bottom: 15px;">
            VIEW REQUEST DETAILS
        </a>
        
        <p style="font-size: 14px; line-height: 1.5; margin-top: 20px; color: #666666;">
            Regular maintenance helps keep your property in excellent condition and ensures tenant satisfaction.
        </p>
    </div>
    
    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777777;">
        © 2025 RentPadHomes | <a href="#" style="color: #3366cc; text-decoration: none;">Contact Support</a>
    </div>
</div>
    ` ,
  });

};