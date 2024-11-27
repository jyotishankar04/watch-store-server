import { NextFunction, Request, Response } from "express";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";
import { orderSortingTypes, OrderStatus } from "../../types/types";

/// Routes for creating orders
const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  let { orderBy, status } = req.query;
  try {
    if (
      status &&
      !Object.values(OrderStatus).includes(
        status.toString().toUpperCase() as OrderStatus
      )
    ) {
      return next(createHttpError(400, "Invalid status"));
    }
    let where;
    if (status) {
      where = {
        status: status.toString().toUpperCase() as OrderStatus,
      };
    }
    const sortingMap: Record<string, object> = {
      HIGHEST_QUANTITY: { OrderedProducts: { _count: "desc" } },
      LOWEST_QUANTITY: { OrderedProducts: { _count: "asc" } },
      NEWEST: { createdAt: "desc" },
      OLDEST: { createdAt: "asc" },
      LOWEST_PRICE: { totalPrice: "asc" },
      HIGHEST_PRICE: { totalPrice: "desc" },
    };

    const orderByField =
      orderBy &&
      Object.keys(sortingMap).includes(orderBy.toString().toUpperCase())
        ? sortingMap[orderBy.toString().toUpperCase()]
        : { createdAt: "desc" }; // Default sorting

    const orders = await prisma.orders.findMany({
      where: where,
      include: {
        OrderedProducts: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
        address: true,
      },
      orderBy: orderByField,
    });

    // Handle case where no orders are found
    if (!orders || orders.length === 0) {
      return next(createHttpError(404, "No orders found"));
    }

    return res.json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { getAllOrders };
