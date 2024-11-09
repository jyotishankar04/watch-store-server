import { config as conf } from "dotenv";

conf();
const _config = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  env: process.env.ENV,
};

export const Config = Object.freeze(_config);
