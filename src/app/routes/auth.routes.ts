import express from "express";
import { authenticateUser, logout } from "../controllers/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});

router.post("/", authenticateUser);

router.get("/logout", authMiddleware, logout);

export default router;
