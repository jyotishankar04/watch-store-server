import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { createCollectionSchema } from "../../utils/adminValidator";
import prisma from "../../config/prisma.config";

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

    const collection = await prisma.collections.create({
      data: {
        name: body.name,
        image: body.image,
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
    return next(createHttpError(500, "Something went wrong"));
  }
};

const getAllCollection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const collections = await prisma.collections.findMany();
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
    const collection = await prisma.collections.delete({
      where: {
        id: id,
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
