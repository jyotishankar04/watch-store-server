import { config as conf } from "dotenv";

conf();
const _config = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  env: process.env.ENV,
  PORT: process.env.PORT,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  PHONE_TESTING_BASE_URL: process.env.PHONE_TESTING_BASE_URL,
  PHONEPE_TESTING_MERCHENT_ID: process.env.PHONEPE_TESTING_MERCHENT_ID,
  PHONE_TESTING_SALT_KEY: process.env.PHONE_TESTING_SALT_KEY,
};

export const Config = Object.freeze(_config);
