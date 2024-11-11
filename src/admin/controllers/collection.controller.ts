import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { createCollectionSchema } from "../../utils/adminValidator";
import prisma from "../../config/prisma.config";
import { CustomRequest } from "../../types/types";
import {
  deleteMultipleOnCloudinary,
  deleteOnCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary";
import { CLOUDINARY_FOLDERS } from "../../constants/cloudinary.constants";

const addCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const body = req.body;
    const parse = createCollectionSchema.safeParse(body);
    if (!parse.success) {
      return next(
        createHttpError(
          400,
          "Validation error: " + parse.error.errors[0].message
        )
      );
    }
    const isExist = await prisma.collections.findFirst({
      where: {
        name: body.name,
      },
    });
    if (isExist) {
      return next(createHttpError(400, "Collection already exist"));
    }

    const _req = req as CustomRequest;
    const file = _req.files?.collectionImage?.[0].path;

    if (!file) {
      return next(createHttpError(400, "Files are required"));
    }
    const result = await uploadOnCloudinary(
      file,
      CLOUDINARY_FOLDERS.COLLECTIONS
    );

    if (!result) {
      return next(createHttpError(500, "Something went wrong"));
    }

    const collection = await prisma.collections.create({
      data: {
        name: body.name,
        image: result.secure_url,
        publicId: result.public_id,
        description: body.description,
      },
    });
    if (!collection) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Something went wrong"));
  }
};

const getAllCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const collections = await prisma.collections.findMany({
      include: {
        _count: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    if (!collections) {
      return next(createHttpError(500, "Something went wrong"));
    }

    return res.status(200).json({
      success: true,
      data: collections,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

const deleteCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const id = req.params.id;
    const result = await prisma.$transaction(async (prisma) => {
      const collectionExists = await prisma.collections.findUnique({
        where: {
          id: id,
        },
        include: {
          products: {
            include: {
              images: true,
            },
          },
        },
      });

      if (!collectionExists) {
        throw new Error(`Collection with ID ${id} does not exist.`);
      }
      // const deleted = await deleteOnCloudinary(
      //   collectionExists.publicId as string
      // );
      // if (!deleted) {
      //   return next(createHttpError(500, "Something went wrong"));
      // }
      const deleteArray = collectionExists.products.map(
        (product) => product.images[0].publicId
      );
      deleteArray.push(collectionExists.publicId as string);
      const deletedImages = await deleteMultipleOnCloudinary(deleteArray);

      if (!deletedImages) {
        return next(createHttpError(500, "Something went wrong"));
      }
      await prisma.images.deleteMany({
        where: {
          Products: {
            collectionId: id,
          },
        },
      });

      await prisma.features.deleteMany({
        where: {
          Products: {
            collectionId: id,
          },
        },
      });

      await prisma.dimensions.deleteMany({
        where: {
          TechnicalData: {
            Products: {
              collectionId: id,
            },
          },
        },
      });

      const collection = await prisma.collections.delete({
        where: {
          id: id,
        },
      });

      return collection;
    });

    if (!result) {
      const deleteCollection = async (
        req: Request,
        res: Response,
        next: NextFunction
      ): Promise<any> => {
        try {
          const id = req.params.id;

          const result = await prisma.$transaction(async (prisma) => {
            // Step 1: Find the collection and include associated products and images
            const collectionExists = await prisma.collections.findUnique({
              where: { id },
              include: {
                products: {
                  include: { images: true },
                },
              },
            });

            if (!collectionExists) {
              throw new Error(`Collection with ID ${id} does not exist.`);
            }

            // Step 2: Delete the collection's public ID from Cloudinary
            const deletedCollection = await deleteOnCloudinary(
              collectionExists.publicId as string
            );
            if (!deletedCollection) {
              console.error("Failed to delete collection from Cloudinary.");
              throw new Error(
                "Error deleting collection image from Cloudinary."
              );
            }

            // Step 3: Delete each product's associated image(s) from Cloudinary
            const imagePublicIds = collectionExists.products.flatMap(
              (product) => product.images.map((image) => image.publicId)
            );
            const deletedImages = await deleteMultipleOnCloudinary(
              imagePublicIds
            );
            if (!deletedImages) {
              console.error("Failed to delete product images from Cloudinary.");
              throw new Error("Error deleting product images from Cloudinary.");
            }

            // Step 4: Delete images from the database
            await prisma.images.deleteMany({
              where: { Products: { collectionId: id } },
            });

            // Step 5: Delete features associated with products
            await prisma.features.deleteMany({
              where: { Products: { collectionId: id } },
            });

            // Step 6: Delete dimensions associated with products
            await prisma.dimensions.deleteMany({
              where: { TechnicalData: { Products: { collectionId: id } } },
            });

            // Step 7: Delete the collection itself
            const deletedCollectionData = await prisma.collections.delete({
              where: { id },
            });

            return deletedCollectionData;
          });

          if (!result) {
            console.error("Transaction result is empty, something went wrong.");
            return next(createHttpError(500, "Collection deletion failed."));
          }

          return res.status(200).json({
            success: true,
            data: result,
          });
        } catch (error) {
          console.error("Deletion error:", error);
          return next(createHttpError(500, "Something went wrong"));
        }
      };

      return next(createHttpError(500, "Something went wrong"));
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Deletion error:", error);
    return next(createHttpError(500, "Something went wrong"));
  }
};
const updateCollection = async (
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
    // Get the existing collection to set defaults
    const existingCollection = await prisma.collections.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      return next(createHttpError(404, "Collection not found"));
    }

    // Set default values if the body fields are missing
    const updatedData = {
      name: body.name ?? existingCollection.name,
      image: body.image ?? existingCollection.image,
      description: body.description ?? existingCollection.description,
    };

    const collection = await prisma.collections.update({
      where: { id },
      data: updatedData,
    });

    return res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error) {
    return next(createHttpError(500, "Something went wrong"));
  }
};

export { addCollection, getAllCollection, deleteCollection, updateCollection };
