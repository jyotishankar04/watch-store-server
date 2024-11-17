import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { CustomRequest } from "../../types/types";
import prisma from "../../config/prisma.config";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { productId } = req.params;
    const { userId } = req as CustomRequest;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const product = await prisma.products.findUnique({
      where: {
        id: productId,
      },
    });
    if (!product) {
      return next(createHttpError(404, "Product not found"));
    }

    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return next(createHttpError(400, "Rating and comment are required"));
    }
    const review = await prisma.reviews.create({
      data: {
        rating,
        content: comment,
        productId,
        userId,
      },
    });

    if (!review) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.json({
      success: true,
      message: "Review created successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.reviews.findMany({
      where: {
        productId,
      },
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!reviews) {
      return next(createHttpError(500, "Something went wrong"));
    }
    const averageRating =
      reviews.reduce((acc, review) => {
        return acc + review.rating;
      }, 0) / reviews.length;
    const totalReviews = reviews.length;
    return res.json({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
        averageRating,
        totalReviews,
      },
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { createReview, getReviews };
