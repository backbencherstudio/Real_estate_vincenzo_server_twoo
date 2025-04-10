import nodemailer from 'nodemailer';
import config from '../config';

export const maintenanceRequestConfiremed = async (to: string, tenantName : string ) => {    
  
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
    subject: 'Maintenance Request Confirmed', 
    text: '', 
    html : `<div style="max-width: 500px; margin: 0 auto; padding: 25px; font-family: 'Arial', sans-serif; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1); border-top: 5px solid #3366cc; background: linear-gradient(to bottom, #ffffff, #f9f9f9);">
  <div style="text-align: center;">
    <h2 style="color: #3366cc; margin: 0 0 20px; font-size: 22px;">Maintenance Request Confirmed</h2>
    <div style="background-color: #f0f9f0; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50; text-align: left;">
      <p style="color: #4CAF50; font-weight: bold; margin: 0 0 10px 0; font-size: 18px;">✓ Your request has been accepted</p>
    </div>
    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: left;">Dear ${tenantName},</p>
    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px; text-align: left;">We've received your maintenance request and our team is already working on it. We'll address your issue as quickly as possible.</p>
    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px; text-align: left;">Our maintenance staff will contact you soon to schedule a convenient time for the repair.</p>

    <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: left;">
      <p style="color: #555; font-size: 15px; margin: 0 0 5px 0; font-weight: bold;">Estimated Timeline:</p>
      <p style="color: #555; font-size: 15px; margin: 0;">We typically resolve similar issues within 24-48 hours.</p>
    </div>

    <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: left;">If you have any questions,  feel free to <a href="mailto:rentpadhomesteam@gmail.com" style="color: #0052cc; text-decoration: none; font-weight: bold;">contact us</a></p>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 13px; margin: 0;">© 2025 RentPadHomes. All rights reserved.</p>
    </div>

  </div>
</div>` ,
  });
};
