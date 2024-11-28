import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { CustomRequest } from "../../types/types";
import prisma from "../../config/prisma.config";
import { getAverageReviewCount } from "../services/reviews.services";

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

    const isReviewExists = await prisma.reviews.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    if (isReviewExists) {
      return next(createHttpError(400, "You already have a review"));
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
      return next(
        createHttpError(500, "Something went wrong in creating review")
      );
    }

    return res.json({
      success: true,
      message: "Review created successfully",
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

// algo
/*
  1. get the product id from the parameters
  2. find the user id from the request context 
  3. fing the user from the database and validate it
  4. get the reviews from the database
  5. calculate the average rating for the product
  6. calculate the total number of reviews for the product
  7. calculate the average rating for the product
  8. return the reviews and the average rating and the total number of reviews
*/
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
    const { averageRating } = getAverageReviewCount(reviews);
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
