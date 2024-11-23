import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { CustomRequest, OrderStatus, PaymentMethods } from "../../types/types";
import prisma from "../../config/prisma.config";
import { getUserById } from "../services/auth.service";
const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { userId } = req as CustomRequest;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const user = await getUserById(userId);
    if (!user) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const { shippingAddressId } = req.body;

    const address = await prisma.addresses.findFirst({
      where: {
        id: shippingAddressId,
      },
    });
    console.log(address);
    if (!address) {
      return next(createHttpError(404, "Address not found"));
    }

    const cartItems = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
            cartId: true,
            product: {
              include: {
                Stocks: true,
              },
            },

            id: true,
          },
        },
      },
    });
    if (!cartItems || !cartItems.items.length) {
      return next(createHttpError(404, "Cart not found or empty"));
    }

    const isProductsAvailable = cartItems.items.every((item) => {
      return item.quantity <= item.product.Stocks.quantity && item.quantity > 0;
    });
    if (!isProductsAvailable) {
      return next(createHttpError(400, "Products is out of stock"));
    }
    let totalPrice =
      cartItems.items.length > 0
        ? cartItems.items.reduce((totalPrice, item) => {
            return totalPrice + item.product.price * item.quantity;
          }, 0)
        : 0;

    if (totalPrice <= 0) {
      return next(createHttpError(400, "Cart is empty"));
    }

    const result = await prisma.$transaction(async (prisma) => {
      const order = await prisma.orders.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          address: {
            connect: {
              id: shippingAddressId,
            },
          },
          paymentType: PaymentMethods.CASH_ON_DELIVERY,
          paymentId: "dummy-payment-id",
          totalPrice: totalPrice,
          status: OrderStatus.ORDER_PLACED,
          OrderedProducts: {
            createMany: {
              data: cartItems.items.map((item) => ({
                productId: item.productId,
                price: item.product.price,
                quantity: item.quantity,
              })),
            },
          },
        },
      });

      // Clear cart
      await prisma.cartItem.deleteMany({
        where: {
          cart: {
            userId: user.id,
          },
        },
      });
      await prisma.stocks.updateMany({
        where: {
          Products: {
            id: {
              in: cartItems.items.map((item) => item.productId),
            },
          },
        },
        data: {
          quantity: {
            decrement: cartItems.items.reduce((total, item) => {
              return total + item.quantity;
            }, 0),
          },
        },
      });

      return order;
    });
    if (!result) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { userId } = req as CustomRequest;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }

    const user = await getUserById(userId);
    if (!user) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const orders = await prisma.orders.findMany({
      where: {
        user: {
          id: userId,
        },
      },
      include: {
        OrderedProducts: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!orders) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};
const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { userId } = req as CustomRequest;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const { id } = req.params;

    const user = await getUserById(userId);
    if (!user) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const order = await prisma.orders.findUnique({
      where: {
        id: id,
      },
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
    });
    if (!order) {
      return next(createHttpError(404, "Order not found"));
    }
    return res.json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { createOrder, getAllOrders, getOrderById };
