import { NextFunction, Request, Response } from "express";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";
import { CustomRequest } from "../../types/types";
import { addressSchema } from "../../utils/app.validator";
import {
  getDetailsByPincode,
  validatePincodeData,
} from "../services/address.service";

/// Endpoint for creating a new address
const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req as CustomRequest;
    const {
      name,
      address,
      city,
      state,
      zipCode,
      contactNumber,
      country,
      landmark,
    } = req.body;
    const validate = addressSchema.safeParse({
      name,
      address,
      city,
      state,
      zipCode,
      contactNumber,
      country,
      landmark,
    });

    if (!validate.success) {
      return next(
        createHttpError(
          400,
          "Validation error: " + validate.error.errors[0].message
        )
      );
    }

    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Addresses: true },
    });

    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    if (user.Addresses.length >= 5) {
      return next(createHttpError(400, "Cannot add more than 5 addresses"));
    }

    const newAddress = await prisma.addresses.create({
      data: {
        name,
        address,
        city,
        state,
        zip: zipCode,
        contactNumber,
        country,
        landmark,

        user: { connect: { id: userId } },
      },
    });
    const getPincodeData = await getDetailsByPincode(zipCode);
    if (getPincodeData[0].Status != "Success") {
      return next(createHttpError(500, "Invalid Pincode"));
    }
    if (getPincodeData[0].PostOffice.length == 0) {
      return next(createHttpError(500, "Invalid Pincode"));
    }
    if (!newAddress) {
      return next(createHttpError(500, "Something went wrong"));
    }

    res
      .status(201)
      .json({ success: true, message: "Address created", data: newAddress });
  } catch (err) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

/// Endpoint for getting all addresses of a user
const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req as CustomRequest;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const addresses = await prisma.addresses.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, message: "Addresses fetched", data: addresses });
  } catch (err) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

// Endpoint for getting address by the id
const getAddressById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req as CustomRequest;
    const { id } = req.params;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const address = await prisma.addresses.findUnique({ where: { id } });
    if (!address) {
      return next(createHttpError(404, "Address not found"));
    }
    res.json({ success: true, message: "Address fetched", data: address });
  } catch (err) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

const deleteAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req as CustomRequest;
    const { id } = req.params;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const addresses = await prisma.addresses.delete({
      where: { id },
    });
    if (!addresses) {
      return next(createHttpError(500, "Something went wrong"));
    }
    res.json({ success: true, message: "Addresses deleted", data: addresses });
  } catch (err) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req as CustomRequest;
    const { id } = req.params;
    const {
      name,
      address,
      city,
      state,
      zipCode,
      contactNumber,
      country,
      landmark,
    } = req.body;
    if (!userId) {
      return next(createHttpError(401, "Unauthorized"));
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const addresses = await prisma.addresses.update({
      where: { id },
      data: {
        name,
        address,
        city,
        state,
        zip: zipCode,
        contactNumber,
        country,
        landmark,
      },
    });
    if (!addresses) {
      return next(createHttpError(500, "Something went wrong"));
    }
    res.json({ success: true, message: "Addresses updated", data: addresses });
  } catch (err) {
    next(createHttpError(500, "Internal Server Error"));
  }
};

export {
  createAddress,
  getAddresses,
  deleteAddresses,
  updateAddress,
  getAddressById,
};
