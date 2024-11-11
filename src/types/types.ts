import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: string;
  files?: {
    collectionImage?: Express.Multer.File[];
    productImages?: Express.Multer.File[];
  };
}
