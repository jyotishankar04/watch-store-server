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
        Cart: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const product = await prisma.products.findUnique({
      where: {
        id: id,
      },
      include: {
        Stocks: true,
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
    if (product.Stocks.quantity <= 0) {
      return next(createHttpError(400, "Product out of stock"));
    }

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
          quantity: 1,
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
          quantity: 1,
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
    let cartItems = await prisma.cartItem.findMany({
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
    // Additional Computations
    const checkoutPrice = cartItems.reduce((acc, item) => {
      return acc + item.product.price * item.quantity;
    }, 0);

    return res.json({
      success: true,
      message: "Cart items retrieved successfully",
      data: {
        cartItems,
        checkoutPrice,
      },
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
    if (!quantity || quantity < 0) {
      return next(createHttpError(400, "Quantity is required"));
    }
    if (quantity > 5) {
      return next(createHttpError(400, "Quantity cannot be more than 5"));
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        id,
      },
      include: {
        product: {
          include: {
            Stocks: true,
          },
        },
      },
    });

    if (!existingCartItem) {
      return next(createHttpError(404, "To set quanity, item must be in cart"));
    }
    if (quantity > 5) {
      return next(createHttpError(400, "Quantity cannot be more than 5"));
    }
    if (existingCartItem.product.Stocks.quantity < quantity && quantity > 0) {
      return next(
        createHttpError(
          400,
          "Out of order quantity, please reduce the quantity"
        )
      );
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

    const cartItem = await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: user.Cart?.id as string,
          productId: id,
        },
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
