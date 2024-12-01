import { Request } from "express";

export interface CustomRequest extends Request {
  userId?: string;
  files?: {
    collectionImage?: Express.Multer.File[];
    productImages?: Express.Multer.File[];
  };
}

export enum PaymentMethods {
  CREDIT_CARD = "CREDIT_CARD",
  UPI = "UPI",
  NET_BANKING = "NET_BANKING",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}

export enum productSortingTypes {
  NEWEST = "newest",
  OLDEST = "oldest",
  LOWEST_PRICE = "lowest_price",
  HIGHEST_PRICE = "highest_price",
  ATOZ = "atoz",
  ZTOA = "ztoa",
  RATING = "rating",
  POPULARITY = "popularity",
}

//! Order Types
export enum orderSortingTypes {
  NEWEST = "newest",
  OLDEST = "oldest",
  LOWEST_PRICE = "lowest_price",
  HIGHEST_PRICE = "highest_price",
  HIGHEST_QUANTITY = "highest_quantity",
  LOWEST_QUANTITY = "lowest_quantity",
}

export enum OrderStatus {
  PENDING = "PENDING",
  ORDER_PLACED = "ORDER_PLACED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  ALL = "ALL",
}
