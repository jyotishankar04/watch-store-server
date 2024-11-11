import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { adminAuthSchema } from "../../utils/adminValidator";
import prisma from "../../config/prisma.config";
import { generateToken } from "../../app/services/auth.service";
import { CustomRequest } from "../../types/types";

const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const body = req.body;

    const validate = adminAuthSchema.safeParse(body);

    if (!validate.success) {
      return next(
        createHttpError(
          400,
          "Validation error: " + validate.error.errors[0].message
        )
      );
    }

    const isExist = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!isExist) {
      return next(createHttpError(401, "Unauthorized"));
    }

    if (!isExist.isAdmin) {
      return next(
        createHttpError(401, "You are not authorized to access the admin panel")
      );
    }

    const token = generateToken(isExist.id);

    res.cookie("adminAuthToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      data: { ...isExist, password: undefined },
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

const checkSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { userId } = req as CustomRequest;
  if (!userId) {
    return next(createHttpError(401, "Unauthorized"));
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      password: false,
      isAdmin: true,
      email: true,
      authProvider: false,
      authProviderId: false,
      createdAt: true,
      updatedAt: true,
      name: true,
      image: true,
      id: true,
    },
  });

  if (!user) {
    return next(createHttpError(401, "Unauthorized"));
  }
  try {
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { authenticateAdmin, checkSession };
