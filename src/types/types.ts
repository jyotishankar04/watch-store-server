import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: string;
  files?: {
    collectionImage?: Express.Multer.File[];
    productImages?: Express.Multer.File[];
  };
}

export enum OrderStatus {
  PENDING = "PENDING",
  ORDER_PLACED = "ORDER_PLACED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethods {
  CREDIT_CARD = "CREDIT_CARD",
  UPI = "UPI",
  NET_BANKING = "NET_BANKING",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}
