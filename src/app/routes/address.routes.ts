import express from "express";
import {
  createAddress,
  deleteAddresses,
  getAddressById,
  getAddresses,
  updateAddress,
} from "../controllers/address.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/", authMiddleware, createAddress);
router.get("/", authMiddleware, getAddresses);
router.delete("/:id", authMiddleware, deleteAddresses);
router.patch("/:id", authMiddleware, updateAddress);
router.get("/:id", authMiddleware, getAddressById);

export default router;
