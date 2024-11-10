import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../../config/prisma.config";
import { createProductSchema } from "../../utils/adminValidator";

const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const body = req.body;

    const parse = createProductSchema.safeParse({
      ...body,
      price: Number(body.price),
    });
    if (!parse.success) {
      return next(
        createHttpError(
          400,
          "Validation error: " + parse.error.errors[0].message
        )
      );
    }
    const isExist = await prisma.products.findFirst({
      where: {
        name: body.name,
      },
    });
    if (isExist) {
      return next(createHttpError(400, "Product already exist"));
    }

    const product = await prisma.products.create({
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        Collection: {
          connect: {
            id: body.collectionId,
          },
        },
        features: {
          createMany: {
            data: body.features.map((feature: any) => ({
              featName: feature,
            })),
          },
        },
        TechnicalData: {
          create: {
            case: body.case,
            strap: body.strap,
            creystal: body.creystal,
            dialColor: body.dialColor,
            waterResistance: body.waterResistance,
            logWidth: body.logWidth,
            movement: body.movement,
            warranty: body.warranty,
            dimensions: {
              create: {
                diameter: body.diameter,
                length: body.length,
                thickness: body.thickness,
              },
            },
          },
        },
      },
      include: {
        features: true,
        TechnicalData: {
          include: {
            dimensions: true,
          },
        },
        images: true,
      },
    });

    if (!product) {
      return next(createHttpError(500, "Something went wrong"));
    }
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const products = await prisma.products.findMany({
      include: {
        TechnicalData: {
          include: {
            dimensions: true,
          },
        },
        features: true,
        images: true,
        Collection: true,
      },
    });
    if (!products) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const id = req.params.id;
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
        features: true,
        images: true,
        Collection: true,
      },
    });
    if (!product) {
      return next(createHttpError(404, "Product not found"));
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const id = req.params.id;
    const body = req.body;

    if (!body) {
      return next(createHttpError(400, "Body is required"));
    }

    const existingProduct = await prisma.products.findUnique({
      where: { id },
      include: {
        TechnicalData: {
          include: {
            dimensions: true,
          },
        },
        features: true,
        images: true,
        Collection: true,
      },
    });

    if (!existingProduct) {
      return next(createHttpError(404, "Product not found"));
    }
    const updatedProduct = await prisma.products.update({
      where: { id },
      data: {
        name: body.name ?? existingProduct.name,
        description: body.description ?? existingProduct.description,
        price: parseFloat(body.price) ?? existingProduct.price,
        features: body.features
          ? {
              set: body.features.map((feature: any) => ({
                featName: feature.featName,
              })),
            }
          : undefined,
        TechnicalData: {
          update: {
            data: {
              ["case"]: body.case ?? existingProduct.TechnicalData.case,
              strap: body.strap ?? existingProduct.TechnicalData.strap,
              creystal: body.creystal ?? existingProduct.TechnicalData.creystal,
              dialColor:
                body.dialColor ?? existingProduct.TechnicalData.dialColor,
              waterResistance:
                body.waterResistance ??
                existingProduct.TechnicalData.waterResistance,
              logWidth: body.logWidth ?? existingProduct.TechnicalData.logWidth,
              movement: body.movement ?? existingProduct.TechnicalData.movement,
              warranty: body.warranty ?? existingProduct.TechnicalData.warranty,
            },
          },
        },
      },
      include: {
        TechnicalData: {
          include: {
            dimensions: true,
          },
        },
        features: true,
        images: true,
      },
    });
    if (body.diameter || body.length || body.thickness) {
      await prisma.dimensions.updateMany({
        where: {
          id: existingProduct?.TechnicalData?.dimensions?.id,
        },
        data: {
          diameter:
            body.diameter ??
            existingProduct?.TechnicalData?.dimensions?.diameter,
          length:
            body.length ?? existingProduct?.TechnicalData?.dimensions?.length,
          thickness:
            body.thickness ??
            existingProduct?.TechnicalData?.dimensions?.thickness,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const id = req.params.id;
    const product = await prisma.products.delete({
      where: {
        id: id,
      },
      include: {
        TechnicalData: {
          include: {
            dimensions: true,
          },
        },
        features: true,
        images: true,
        Collection: true,
      },
    });
    if (!product) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductById,
};
