import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../../config/prisma.config";
import { CustomRequest } from "../../types/types";

const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { userId } = req as CustomRequest;
  try {
    const users = await prisma.user.findFirst({
      where: { id: userId },
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
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { userId } = req as CustomRequest;
    const { name } = req.body;
    const isExist = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!isExist) {
      return next(createHttpError(404, "User not found"));
    }
    if (!name) {
      return next(createHttpError(400, "Name is required"));
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
      },
    });

    if (!user) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { getUser, updateUser };
