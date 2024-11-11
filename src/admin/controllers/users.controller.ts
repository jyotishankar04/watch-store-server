import { NextFunction, Request, Response } from "express";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";

const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        password: false,
        isAdmin: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        image: true,
        id: true,
        authProvider: true,
        authProviderId: true,
      },
    });
    if (!users) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      status: "success",
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { getAllUsers };
