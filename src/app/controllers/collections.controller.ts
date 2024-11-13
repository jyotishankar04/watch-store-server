import { NextFunction, Request, Response } from "express";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";

const getAllCollections = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const collections = await prisma.collections.findMany();
    if (!collections) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      success: true,
      message: "Collections fetched successfully",
      data: collections,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { getAllCollections };
