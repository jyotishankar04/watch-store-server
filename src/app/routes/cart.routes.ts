import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  addToCart,
  deleteCartItem,
  getAllCartItems,
  updateCartItem,
} from "../controllers/cart.controller";

const router = express.Router();

router.post("/:id", authMiddleware, addToCart);
router.get("/", authMiddleware, getAllCartItems);
router.patch("/:id", authMiddleware, updateCartItem);
router.delete("/:id", authMiddleware, deleteCartItem);
export default router;
