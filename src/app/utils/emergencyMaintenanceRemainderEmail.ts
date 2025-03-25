/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';
import config from '../config';

export const emergencyMaintenanceRemainderEmail = async (to: string) => {

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
    subject: "Emergency Maintenance Request",
    text: '',
    html: `
   <div style="font-family: 'Arial', sans-serif; max-width: 500px; margin: 0 auto; background-color: #f73b3b; color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden;">
    <div style="background-color: #ff0000; padding: 15px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">
            ⚠️ EMERGENCY MAINTENANCE ⚠️
        </h1>
    </div>
    
    <div style="padding: 20px; text-align: center;">
        <h2 style="font-size: 20px; margin-bottom: 15px; color: white;">
            Urgent Action Required Immediately
        </h2>
        
        <div style="background-color: #ff4d4d; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin: 0; font-weight: bold; font-size: 16px;">
                Critical Maintenance Issue Detected
            </p>
        </div>
        
        <a href="https://rentpadhomes.com/owner/maintenance" style="display: inline-block; background-color: white; color: #ff0000; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;">
            CHECK HERE
        </a>
        
        <p style="font-size: 14px; line-height: 1.5; margin-top: 15px;">
            Immediate attention is crucial to prevent potential property damage.
        </p>
    </div>
    
    <div style="background-color: #ff2b2b; padding: 10px; text-align: center; font-size: 12px;">
        © 2025 RentPadHomes Team - Urgent Notification
    </div>
</div>
    ` ,
  });

};