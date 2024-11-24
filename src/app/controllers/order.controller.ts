import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { CustomRequest, OrderStatus, PaymentMethods } from "../../types/types";
import prisma from "../../config/prisma.config";
import { getUserById } from "../services/auth.service";
import { Config } from "../../config/config";
import crypto, { randomUUID } from "crypto";
import sha256 from "sha256";
import axios from "axios";
const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { userId } = req as CustomRequest;
    let redirectUrl;
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
    if (!cartItems || cartItems.items.length <= 0) {
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

    // Generate transaction details
    const merchantTransactionId = randomUUID();
    const normalPayload = {
      merchantId: Config.PHONEPE_TESTING_MERCHENT_ID,
      merchantTransactionId,
      merchantUserId: user.id,
      amount: totalPrice * 100, // Amount in paise
      redirectUrl: `http://localhost:3000/payment/status?id=${merchantTransactionId}&shippingAddressId=${shippingAddressId}`,
      redirectMode: "REDIRECT",
      mobileNumber: address.contactNumber, // User's contact number
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Create Base64 payload
    const base64Payload = Buffer.from(
      JSON.stringify(normalPayload),
      "utf8"
    ).toString("base64");

    // Generate X-Verify checksum
    const SALT_INDEX = 1;
    const checksumString =
      base64Payload + "/pg/v1/pay" + Config.PHONE_TESTING_SALT_KEY;
    const sha256Value = crypto
      .createHash("sha256")
      .update(checksumString)
      .digest("hex");
    const xVerifyChecksum = `${sha256Value}###${SALT_INDEX}`;

    try {
      // Make API call to PhonePe
      const phonePeResponse = await axios.post(
        `${Config.PHONE_TESTING_BASE_URL}/pg/v1/pay`,
        { request: base64Payload },
        {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerifyChecksum,
            accept: "application/json",
          },
        }
      );

      redirectUrl =
        phonePeResponse.data.data.instrumentResponse.redirectInfo.url;
    } catch (apiError: any) {
      console.error(
        "Error creating payment payload:",
        apiError.response?.data || apiError.message
      );
      return next(
        createHttpError(500, "Payment API Error: " + apiError.message)
      );
    }

    return res.json({
      success: true,
      message: "Order Initialized",
      data: {
        redirectUrl,
      },
    });
  } catch (error) {
    return next(createHttpError(500, JSON.stringify(error)));
  }
};

const checkStatusAndVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const merchantTransactionId = req.body.merchantTransactionId;
  const shippingAddressId = req.body.shippingAddressId;
  const merchantId = Config.PHONEPE_TESTING_MERCHENT_ID;
  const _req = req as CustomRequest;
  const { userId } = _req;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return next(createHttpError(401, "Unauthorized"));
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

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
    Config.PHONE_TESTING_SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `${Config.PHONE_TESTING_BASE_URL}/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  try {
    const response = await axios.request(options);
    if (response.data.success !== true) {
      return res.json({
        success: false,
        message: "Payment Faild",
        data: {
          redirectUrl: "http://localhost:3000/payment/fail",
        },
      });
    }
    const result = await prisma.$transaction(
      async (prisma) => {
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
      },
      {
        timeout: 5000,
      }
    );
    if (!result) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.json({
      success: true,
      message: "Payment Success",
      data: {
        orderDetails: result,
        redirectUrl: "http://localhost:3000/payment/success",
      },
    });
  } catch (error) {
    return next(createHttpError(500, "Error in creating payment"));
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

export { createOrder, getAllOrders, getOrderById, checkStatusAndVerify };
