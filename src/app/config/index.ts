import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,  
  sender_email:process.env.SENDER_EMAIL,
  contact_us_recive_email:process.env.CONTACT_US_RECIVE_EMAIL,
  email_pass:process.env.EMAIL_PASS,
  email_port:process.env.EMAIL_PORT,
  client_base_url:process.env.CLIENT_BASE_URL,
  stripe_test_secret_key:process.env.STRIPE_TEST_SECRET_KEY,
  stripe_live_secret_key:process.env.STRIPE_LIVE_SECRET_KEY,
  stripe_webhook_secret_key:process.env.STRIPE_WEBHOOK_SECRET_KEY,
  frontend_url:process.env.FRONTEND_URL
};
