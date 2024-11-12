import express from "express";
import { authenticateAdmin } from "../../admin/controllers/adminauth.controller";
import { getStocks } from "../../admin/controllers/stocks.controller";

const router = express.Router();

// router.get("/", authenticateAdmin, getStocks);

export default router;
