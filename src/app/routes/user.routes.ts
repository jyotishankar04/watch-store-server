import express from "express";
import { authenticateUser, getProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.get("/me", authMiddleware, getProfile);

export default router;
