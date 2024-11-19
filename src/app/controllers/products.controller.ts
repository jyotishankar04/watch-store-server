import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../../config/prisma.config";
import { getAverageReviewCount } from "../services/reviews.services";

const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { orderBy: sortBy, collection } = req.query;

    // Build 'where' condition based on the collection filter
    const where = collection
      ? {
          Collection: {
            name: String(collection).toUpperCase(),
          },
        }
      : {};

    // Determine sorting order based on 'sortBy' value, with default as 'newest' (createdAt: "desc")
    const orderBy: { [key: string]: "asc" | "desc" } =
      sortBy === "atoz"
        ? { name: "asc" }
        : sortBy === "ztoa"
        ? { name: "desc" }
        : sortBy === "newest" || !sortBy // Default to newest if 'sortBy' is not provided
        ? { createdAt: "desc" }
        : sortBy === "oldest"
        ? { createdAt: "asc" }
        : sortBy === "high"
        ? { price: "desc" }
        : sortBy === "low"
        ? { price: "asc" }
        : { createdAt: "desc" };

    const products = await prisma.products.findMany({
      where: where,

      include: {
        TechnicalData: {
          include: {
            dimensions: true,
          },
        },
        features: true,
        images: true,
        Collection: true,
        Stocks: {
          select: {
            quantity: true,
          },
        },
        _count: true,
      },
      orderBy: orderBy,
    });

    if (!products) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const product = await prisma.products.findUnique({
      where: {
        id: id,
      },
      include: {
        TechnicalData: {
          include: {
            dimensions: true,
          },
        },
        Stocks: {
          select: {
            quantity: true,
          },
        },
        features: true,
        images: true,
        Collection: true,
        Reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                id: true,
                email: true,
              },
            },
          },
        },
        _count: true,
      },
    });

    if (!product) {
      return next(createHttpError(404, "Product not found"));
    }
    const { averageRating } = getAverageReviewCount(product?.Reviews);

    const newProductResponse = {
      ...product,
      Reviews: {
        reviews: Array.from(product.Reviews),
        averageRating,
      },
    };
    let isInStock = false;
    if (product.Stocks.quantity > 0) {
      isInStock = true;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...newProductResponse,
        isInStock,
      },
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { getProducts, getProductById };
