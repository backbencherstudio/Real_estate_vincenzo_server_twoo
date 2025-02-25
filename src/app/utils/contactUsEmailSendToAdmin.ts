import nodemailer from 'nodemailer';
import config from '../config';

export const contactUsEmailSendToAdmin = async (
    email: string,
    message: string,
    phoneNumber: string,
    fullName: string
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: config.contact_us_recive_email,
                pass: config.email_pass,
            },
        });

        const mailOptions = {
            from: `"${fullName}" <${config.contact_us_recive_email}>`,
            replyTo: email,
            to: config.contact_us_recive_email,
            subject: "New Contact Us Message",
            html: `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
      <div style="text-align: center; padding-bottom: 10px; border-bottom: 2px solid #0073e6;">
          <h2 style="color: #0073e6; margin-bottom: 5px;">New Contact Us Message</h2>
          <p style="color: #555; font-size: 14px;">You have received a new inquiry from your website.</p>
      </div>

      <div style="padding: 15px; background: #ffffff; border-radius: 8px; margin-top: 15px;">
          <p style="color: #333; font-size: 16px;"><strong>Name:</strong> ${fullName}</p>
          <p style="color: #333; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0073e6; text-decoration: none;">${email}</a></p>
          <p style="color: #333; font-size: 16px;"><strong>Phone Number:</strong> <a href="tel:${phoneNumber}" style="color: #0073e6; text-decoration: none;">${phoneNumber}</a></p>
          <p style="color: #333; font-size: 16px;"><strong>Message:</strong></p>
          <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-size: 14px; color: #555;">
              ${message}
          </div>
      </div>

      <div style="text-align: center; margin-top: 20px; font-size: 14px; color: #777;">
          <p style="margin-bottom: 5px;">Need further assistance? <a href="mailto:${config.contact_us_recive_email}" style="color: #0073e6; text-decoration: none;">Reply to this email</a></p>
          <p style="font-size: 12px;">© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </div>
  </div>
`
        };
         await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
