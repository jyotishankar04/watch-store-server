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
const router = Router();

router.post("/auth", authenticateAdmin);
router.get("/auth", adminAuthMiddleware, checkSession);

//  !collections
router.post("/collections", adminAuthMiddleware, addCollection);
router.get("/collections", adminAuthMiddleware, getAllCollection);
router.delete("/collections/:id", adminAuthMiddleware, deleteCollection);
router.patch("/collections/:id", adminAuthMiddleware, updateCollection);

//! products
router.post("/products", adminAuthMiddleware, addProduct);
router.get("/products", adminAuthMiddleware, getAllProducts);
router.delete("/products/:id", adminAuthMiddleware, deleteProduct);
router.patch("/products/:id", adminAuthMiddleware, updateProduct);
router.get("/products/:id", adminAuthMiddleware, getProductById);

//! Features
router.get("/features", adminAuthMiddleware, getFeatures);

export default router;
