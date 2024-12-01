import { NextFunction, Request, Response } from "express";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";
import { orderSortingTypes, OrderStatus } from "../../types/types";
import { OrdersStatus, Prisma } from "@prisma/client";

/// Here is the controller for getting all the order details
const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  let { orderBy, status, page = 1, limit = 20 } = req.query;

  try {
    const skip = (Number(page) - 1) * Number(limit);

    if (
      status &&
      !Object.values(OrderStatus).includes(
        status.toString().toUpperCase() as OrderStatus
      )
    ) {
      status = "";
    }
    let where = {};
    if (status) {
      status = status.toString().toUpperCase();
      if (status === OrdersStatus.ORDER_PLACED) {
        where = {
          status: {
            equals: OrdersStatus.ORDER_PLACED,
          },
        };
      }
      if (status === OrdersStatus.CANCELLED) {
        where = {
          status: {
            equals: OrdersStatus.CANCELLED,
          },
        };
      }
      if (status === OrdersStatus.PENDING) {
        where = {
          status: {
            equals: OrdersStatus.PENDING,
          },
        };
      }
      if (status === OrdersStatus.DELIVERED) {
        where = {
          status: {
            equals: OrdersStatus.DELIVERED,
          },
        };
      }
      if (status === OrdersStatus.SHIPPED) {
        where = {
          status: {
            equals: OrdersStatus.SHIPPED,
          },
        };
      }
    } else {
      where = {};
    }
    console.log(where);
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
        : { createdAt: "desc" };

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
      take: Number(limit),
      skip: skip,
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
