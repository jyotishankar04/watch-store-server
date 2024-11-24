import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  checkStatusAndVerify,
  createOrder,
  getAllOrders,
  getOrderById,
} from "../controllers/order.controller";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getAllOrders);
router.get("/:id", authMiddleware, getOrderById);
router.post("/paymentStatus", authMiddleware, checkStatusAndVerify);
export default router;
