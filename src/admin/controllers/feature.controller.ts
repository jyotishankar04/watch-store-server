import { NextFunction, Request, Response } from "express";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";

const getFeatures = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const features = await prisma.features.findMany();
    if (!features) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      status: "success",
      message: "Features retrieved successfully",
      data: features,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { getFeatures };
