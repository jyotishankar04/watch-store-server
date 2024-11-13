import express from "express";
import { getAllCollections } from "../controllers/collections.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.get("/", authMiddleware, getAllCollections);

export default router;
