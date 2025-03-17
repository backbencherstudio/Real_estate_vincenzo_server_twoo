import nodemailer from 'nodemailer';
import config from '../config';

export const sendTransfarNotificationEmailAdminToOwner = async (to: string, amount: number, name  : string) => {    

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
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
    subject: 'Transfer Amount from RentPadHomes', 
    text: '', 
    html: `
    <div style="text-align: center; font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; border-radius: 12px; background: linear-gradient(to bottom, #f9f9f9, #f2f2f2); box-shadow: 0 5px 15px rgba(0,0,0,0.08); max-width: 600px; margin: 0 auto;">
        <!-- Header with logo space -->
        <div style="margin-bottom: 25px;">
            <div style="background-color: #0A5173; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #ffffff; font-size: 26px; font-weight: bold; margin: 0;">Payment Transfer</h2>
            </div>
        </div>
        
        <!-- Content -->
        <div style="background-color: white; border-radius: 8px; padding: 25px; text-align: left; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
            <p style="font-size: 17px; color: #333; line-height: 1.5;">Dear <span style="font-weight: bold; color: #0A5173;">${name}</span>,</p>
            
            <p style="font-size: 17px; color: #333; line-height: 1.5;">We are happy to inform you that the transfer for this month's payment has been successfully processed from RentPadHomes.</p>
            
            <div style="background-color: #f7fbff; border-left: 4px solid #0A5173; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="font-size: 17px; margin: 0; color: #333;">Amount Transferred:</p>
                <p style="font-size: 28px; font-weight: bold; color: #0A5173; margin: 5px 0 0 0;">$${amount} USD</p>
            </div>
            
            <p style="font-size: 17px; color: #333; line-height: 1.5;">Please be patient, and within <span style="font-weight: bold;">2 to 7 business days</span>, the funds will be reflected in your bank account.</p>
            
            <p style="font-size: 17px; color: #333; line-height: 1.5;">Once the payment has been received, kindly update the payment history status for confirmation.</p>
            
            <p style="font-size: 17px; color: #333; line-height: 1.5; margin-top: 25px;">Thank you for being a valued part of the RentPadHomes family.</p>
            
            <p style="font-size: 17px; color: #333; line-height: 1.5;">Best regards,<br>The RentPadHomes Team</p>
        </div>
        
        <!-- Footer -->
        <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e2e2;">
            <p style="font-size: 14px; color: #777; margin: 0;">© 2025 RentPadHomes. All rights reserved.</p>
        </div>
    </div>
`,
  });
};
