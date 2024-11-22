import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { createOrder } from "../controllers/order.controller";

const router = express.Router();

router.get("/", authMiddleware, createOrder);

export default router;
