import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join((process.cwd(), ".env")) });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  twillo_sid: process.env.TWILLO_ACCOUNT_SID,
  twillo_auth: process.env.TWILLO_AUTH_TOKEN,
  twillo_number: process.env.TWILLO_PHONE_NUM,
  smtp_host: process.env.SMTP_HOST,
  smtp_port: process.env.SMTP_PORT,
  smtp_user: process.env.SMTP_USER,
  smtp_password: process.env.SMTP_PASSWORD,
};
