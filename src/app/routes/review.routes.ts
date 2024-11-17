import express from "express";
import { createReview, getReviews } from "../controllers/review.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/:productId", authMiddleware, createReview);
router.get("/:productId", authMiddleware, getReviews);

export default router;
