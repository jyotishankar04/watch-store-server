import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import prisma from "../../config/prisma.config";
import { createProductSchema } from "../../utils/adminValidator";
import { CustomRequest, productSortingTypes } from "../../types/types";
import {
  deleteMultipleOnCloudinary,
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary";
import { CLOUDINARY_FOLDERS } from "../../constants/cloudinary.constants";

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
      console.log(parse.error);
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

    const _req = req as CustomRequest;
    const files = _req.files?.productImages;

    if (!files) {
      return next(createHttpError(400, "Files are required"));
    }

    const imagesResult = await Promise.all(
      files.map(async (file: any) => {
        const result = await uploadOnCloudinary(
          file.path,
          CLOUDINARY_FOLDERS.PRODUCTS
        );
        return {
          url: result?.secure_url,
          publicId: result?.public_id,
        };
      })
    );
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
        images: {
          createMany: {
            data: await Promise.all(
              imagesResult.map((image: any) => {
                return {
                  url: image.url,
                  publicId: image.publicId,
                };
              })
            ),
          },
        },
        Stocks: {
          create: {
            quantity: 5,
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
    const {
      page = 1,
      limit = 20,
      collection = "",
      orderBy = productSortingTypes.NEWEST,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const collections = prisma.collections.findMany();
    const collectionsNames = (await collections).map((collection) => {
      return collection.name.toUpperCase();
    });

    const where = collectionsNames.includes(String(collection).toUpperCase())
      ? {
          Collection: {
            name: collection as string,
          },
        }
      : {};

    let orderByOptions: {
      [key: string]:
        | "asc"
        | "desc"
        | {
            _count: "asc" | "desc";
          };
    } = {
      createdAt: "desc",
    };

    if (orderBy === productSortingTypes.NEWEST) {
      orderByOptions.createdAt = "desc";
    } else if (orderBy === productSortingTypes.OLDEST) {
      orderByOptions.createdAt = "asc";
    } else if (orderBy === productSortingTypes.HIGHEST_PRICE) {
      orderByOptions = { price: "desc" };
    } else if (orderBy === productSortingTypes.LOWEST_PRICE) {
      orderByOptions = { price: "asc" };
    } else if (orderBy === productSortingTypes.ATOZ) {
      orderByOptions = { name: "asc" };
    } else if (orderBy === productSortingTypes.ZTOA) {
      orderByOptions = { name: "desc" };
    } else if (orderBy === productSortingTypes.RATING) {
      orderByOptions = {
        Reviews: {
          _count: "desc",
        },
      };
    } else if (orderBy === productSortingTypes.POPULARITY) {
      orderByOptions = {
        OrderedProducts: {
          _count: "desc",
        },
      };
    }

    const products = await prisma.products.findMany({
      where,
      skip,
      take: Number(limit),
      include: {
        TechnicalData: {
          include: {
            dimensions: true,
          },
        },
        features: true,
        images: true,
        Collection: true,
        Reviews: true,
        Stocks: true,
        _count: {
          select: {
            Reviews: true,
            OrderedProducts: true,
          },
        },
      },
      orderBy: orderByOptions,
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

    const result = await prisma.$transaction(async (prisma) => {
      const productExists = await prisma.products.findUnique({
        where: { id },
        include: {
          images: true,
        },
      });

      if (!productExists) {
        throw new Error(`Product with ID ${id} does not exist.`);
      }
      const deleteArray = productExists.images.map((image) => image.publicId);
      const deletedRes = await deleteMultipleOnCloudinary(deleteArray);
      if (!deletedRes) {
        return next(createHttpError(500, "Something went wrong"));
      }
      // Delete related records
      await prisma.images.deleteMany({
        where: { productsId: id },
      });

      await prisma.features.deleteMany({
        where: { productsId: id },
      });

      const product = await prisma.dimensions.deleteMany({
        where: {
          TechnicalData: {
            Products: {
              id: id,
            },
          },
        },
      });

      return product;
    });

    if (!result) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
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
