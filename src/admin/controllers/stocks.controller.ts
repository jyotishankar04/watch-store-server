import { NextFunction, Request, Response } from "express";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";

// This is the controller for getting the all stocks from the database as per the product
//
const getStocks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { collection, orderBy: sortBy } = req.query;
    let where = {};
    if (collection) {
      where = {
        Products: {
          Collection: {
            id: collection,
          },
        },
      };
    }
    let orderBy = {};
    if (sortBy) {
      if (sortBy === "quantity") {
        orderBy = {
          quantity: "asc",
        };
      }
      if (sortBy === "name") {
        orderBy = {
          Products: {
            name: "asc",
          },
        };
      }
      if (sortBy === "date") {
        orderBy = {
          Products: {
            createdAt: "asc",
          },
        };
      }
    }
    const stocks = await prisma.stocks.findMany({
      include: {
        Products: true,
      },
      where: where ? where : {},
      orderBy: orderBy
        ? orderBy
        : {
            quantity: "asc",
          },
    });
    if (!stocks) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.status(200).json({
      success: true,
      message: "Stocks retrieved successfully",
      data: stocks,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};
const updateStocks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const id = req.params.id;
    const { quantity } = req.body;
    if (!quantity || quantity < 0) {
      return next(createHttpError(400, "Quantity is required"));
    }
    const isStockExist = await prisma.stocks.findFirst({
      where: {
        id: id,
      },
    });
    if (!isStockExist) {
      return next(createHttpError(400, "Stock not found"));
    }

    const stock = await prisma.stocks.update({
      where: {
        id: id,
      },
      data: {
        quantity: Number(quantity),
      },
    });

    if (!stock) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: stock,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { getStocks, updateStocks };
