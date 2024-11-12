import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  getProductById,
  getProducts,
} from "../controllers/products.controller";

const router = express.Router();

router.get("/", authMiddleware, getProducts);
router.get("/:id", authMiddleware, getProductById);
export default router;
