import { NextFunction, Request, Response } from "express";
import { CustomRequest } from "../../types/types";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";

const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { userId } = req as CustomRequest;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        Cart: true,
      },
    });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const product = await prisma.products.findUnique({
      where: {
        id: id,
      },
    });
    if (!product) {
      return next(createHttpError(404, "Product not found"));
    }
    const isAlreadyInCart = await prisma.cartItem.findFirst({
      where: {
        product: {
          id: id,
        },
        cart: {
          user: {
            id: userId,
          },
        },
      },
    });
    if (isAlreadyInCart) {
      return next(createHttpError(400, "Product already in cart"));
    }
    let cartItem;
    if (!user.Cart?.id) {
      const cart = await prisma.cart.create({
        data: {
          user: {
            connect: { id: userId },
          },
        },
      });
      cartItem = await prisma.cartItem.create({
        data: {
          product: {
            connect: { id },
          },
          cart: {
            connect: { id: cart.id },
          },
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          product: {
            connect: { id },
          },
          cart: {
            connect: { id: user.Cart.id },
          },
        },
      });
    }
    if (!cartItem) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      success: true,
      message: "Product added to cart successfully",
      data: cartItem,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

const getAllCartItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { userId } = req as CustomRequest;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        Cart: true,
      },
    });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const cartItems = await prisma.cartItem.findMany({
      where: {
        cart: {
          user: {
            id: userId,
          },
        },
      },
      select: {
        cartId: true,
        id: true,
        productId: true,
        quantity: true,
        createdAt: true,
        updatedAt: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            images: {
              select: {
                id: true,
                url: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!cartItems) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      success: true,
      message: "Cart items retrieved successfully",
      data: cartItems,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    console.log(id);
    if (!quantity || quantity < 0) {
      return next(createHttpError(400, "Quantity is required"));
    }
    if (quantity > 5) {
      return next(createHttpError(400, "Quantity cannot be more than 5"));
    }
    const cartItem = await prisma.cartItem.update({
      where: {
        id: id,
      },
      data: {
        quantity: Number(quantity),
      },
    });
    if (!cartItem) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      success: true,
      message: "Cart item updated successfully",
      data: cartItem,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

const deleteCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(createHttpError(400, "Cart item ID is required"));
    }
    const isCartItemExist = await prisma.cartItem.findUnique({
      where: {
        id: id,
      },
    });
    if (!isCartItemExist) {
      return next(createHttpError(400, "Cart item not found"));
    }

    const cartItem = await prisma.cartItem.delete({
      where: {
        id: id,
      },
    });
    if (!cartItem) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.json({
      success: true,
      message: "Cart item deleted successfully",
      data: cartItem,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { addToCart, getAllCartItems, updateCartItem, deleteCartItem };
