import jwt from "jsonwebtoken";
import { Config } from "../../config/config";
import prisma from "../../config/prisma.config";

export const generateToken = (id: string) => {
  return jwt.sign({ id }, Config.JWT_SECRET as string, {
    expiresIn: "365d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, Config.JWT_SECRET as string);
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return user;
};
