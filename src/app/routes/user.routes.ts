import express, { NextFunction, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { CustomRequest } from "../../types/types";
import prisma from "../../config/prisma.config";
import createHttpError from "http-errors";
import { getUser, updateUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/me", authMiddleware, getUser);
router.post("/me/edit", authMiddleware, updateUser);

export default router;
