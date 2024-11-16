import { NextFunction, Request, Response } from "express";
import { userCreateSchema } from "../../utils/app.validator";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { Config } from "../../config/config";
import prisma from "../../config/prisma.config";
import { generateToken } from "../services/auth.service";
import { CustomRequest } from "../../types/types";

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const body = req.body;
    const validate = userCreateSchema.safeParse(body);

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
    if (isExist) {
      const update = await prisma.user.update({
        where: {
          id: isExist.id,
        },
        data: {
          authProvider: body.provider,
          authProviderId: body.providerId,
        },
      });

      if (!update) {
        return next(createHttpError(500, "Something went wrong"));
      }

      const accessToken = generateToken(isExist.id);
      if (!accessToken) {
        return next(createHttpError(500, "Something went wrong"));
      }

      return res.status(200).json({
        message: "Welcome back " + isExist.name.substring(0, 1),
        success: true,
        data: isExist,
        accessToken: accessToken,
      });
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        image: body.image,
        authProvider: body.provider,
        authProviderId: body.providerId,
        isAdmin: false,
      },
    });

    if (!user) {
      return next(createHttpError(500, "Something went wrong"));
    }

    const accessToken = generateToken(user.id);

    if (!accessToken) {
      return next(createHttpError(500, "Something went wrong"));
    }

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "none",
      // secure: true,
    });

    return res.status(200).json({
      message: "Welcome " + user.name.substring(0, 1),
      success: true,
      data: user,
      accessToken: accessToken,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    res.clearCookie("accessToken");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { authenticateUser, logout };
