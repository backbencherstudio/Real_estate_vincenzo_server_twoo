import nodemailer from 'nodemailer';
import config from '../config';

export const maintenanceComplete = async (to: string, tenantName : string ) => {    
  
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
    subject: 'Issue Resolved', 
    text: '', 
    html : `<div style="max-width: 500px; margin: 0 auto; padding: 25px; font-family: 'Arial', sans-serif; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.1); border-top: 5px solid #3366cc; background: linear-gradient(to bottom, #ffffff, #f9f9f9);">
  <div style="text-align: center;">
    <h2 style="color: #3366cc; margin: 0 0 20px; font-size: 22px;">Great News! Issue Resolved</h2>
    <div style="background-color: #f0f9f0; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50; text-align: center;">
      <div style="font-size: 32px; color: #4CAF50; margin-bottom: 5px;">✓</div>
      <p style="color: #4CAF50; font-weight: bold; margin: 0; font-size: 18px;">Maintenance Complete</p>
    </div>
    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px; text-align: left;">Dear ${tenantName},</p>
    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px; text-align: left;">We're happy to inform you that the maintenance issue you reported has been successfully resolved. Our team has completed all necessary repairs and the issue should now be fixed.</p>
   
    <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 15px; text-align: left;">Your comfort and satisfaction are our top priorities. If you encounter any further issues or if the current problem persists, please don't hesitate to contact us.</p>
   
    <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: left;">Thank you for choosing RentPadHomes. We appreciate your trust in us!</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 13px; margin: 0;">© 2025 RentPadHomes. All rights reserved.</p>
    </div>
  </div>
</div>` ,
  });
};
