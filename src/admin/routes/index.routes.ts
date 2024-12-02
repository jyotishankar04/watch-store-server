import { Router } from "express";
import {
  authenticateAdmin,
  checkSession,
} from "../controllers/adminauth.controller";
import {
  addCollection,
  deleteCollection,
  getAllCollection,
  updateCollection,
} from "../controllers/collection.controller";
import { adminAuthMiddleware } from "../../middlewares/auth.middleware";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/products.controller";
import { getFeatures } from "../controllers/feature.controller";
import { getAllUsers } from "../controllers/users.controller";
import { upload } from "../../middlewares/multer.middlewares";
import { getStocks, updateStocks } from "../controllers/stocks.controller";
import {
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orders.controller";
const router = Router();

router.post("/auth", authenticateAdmin);
router.get("/auth", adminAuthMiddleware, checkSession);

//! User

router.get("/users", adminAuthMiddleware, getAllUsers);

//  !collections
router.post(
  "/collections",
  adminAuthMiddleware,
  upload.fields([{ name: "collectionImage", maxCount: 1 }]),
  addCollection
);
router.get("/collections", adminAuthMiddleware, getAllCollection);
router.delete("/collections/:id", adminAuthMiddleware, deleteCollection);
router.patch("/collections/:id", adminAuthMiddleware, updateCollection);

//! products
router.post(
  "/products",
  adminAuthMiddleware,
  upload.fields([{ name: "productImages", maxCount: 5 }]),
  addProduct
);
router.get("/products", adminAuthMiddleware, getAllProducts);
router.delete("/products/:id", adminAuthMiddleware, deleteProduct);
router.patch("/products/:id", adminAuthMiddleware, updateProduct);
router.get("/products/:id", adminAuthMiddleware, getProductById);

//! Features
router.get("/features", adminAuthMiddleware, getFeatures);

//! Stocks
router.get("/stocks", adminAuthMiddleware, getStocks);
router.patch("/stocks/:id", adminAuthMiddleware, updateStocks); /// update stock

//! Orders Routes

router.get("/orders", adminAuthMiddleware, getAllOrders);
router.patch("/orders/:orderId", adminAuthMiddleware, updateOrderStatus);

export default router;
