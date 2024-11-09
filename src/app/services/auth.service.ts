import jwt from "jsonwebtoken";
import { Config } from "../../config/config";

export const generateToken = (id: string) => {
  return jwt.sign({ id }, Config.JWT_SECRET as string, {
    expiresIn: "365d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, Config.JWT_SECRET as string);
};
