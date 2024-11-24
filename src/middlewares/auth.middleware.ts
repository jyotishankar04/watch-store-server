import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Config } from "../config/config";
import prisma from "../config/prisma.config";
import { CustomRequest } from "../types/types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized ",
      });
    }
    const { id } = jwt.verify(accessToken, Config.JWT_SECRET as string) as {
      id: string;
    };

    (req as CustomRequest).userId = id;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized ",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export const adminAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const accessToken = req.cookies.adminAuthToken;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const { id } = jwt.verify(accessToken, Config.JWT_SECRET as string) as {
      id: string;
    };

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    if (!user.isAdmin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    (req as CustomRequest).userId = id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};
