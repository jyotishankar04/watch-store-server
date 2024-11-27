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

    // Convert orderBy to lowercase for matching
    const orderByField =
      orderBy &&
      Object.keys(sortingMap).includes(orderBy.toString().toUpperCase())
        ? sortingMap[orderBy.toString().toUpperCase()]
        : { createdAt: "desc" }; // Default sorting

    // Fetch orders with Prisma
    const orders = await prisma.orders.findMany({
      where: where, // Apply filters (assumes 'where' is defined earlier)
      include: {
        OrderedProducts: {
          include: {
            product: {
              include: {
                images: true, // Include images for each product
              },
            },
          },
        },
        address: true, // Include address details
      },
      orderBy: orderByField, // Apply sorting
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
