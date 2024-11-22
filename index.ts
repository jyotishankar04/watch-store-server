import express, { NextFunction, Request, Response } from "express";
import AdminRoutes from "./src/admin/routes/index.routes";
import AuthRoutes from "./src/app/routes/auth.routes";
import UserRoutes from "./src/app/routes/user.routes";
import ProductRoutes from "./src/app/routes/products.routes";
import CartRoutes from "./src/app/routes/cart.routes";
import ReviewRoutes from "./src/app/routes/review.routes";
import CollectionController from "./src/app/routes/collections.routes";
import AddressRoutes from "./src/app/routes/address.routes";
import OrderController from "./src/app/routes/order.routes";
import globalErrorHandler from "./GlobalErrorHandler";
import { HttpError } from "http-errors";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to Justwatches");
});
app.get("/healthcheck", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Justwatches",
    description: "Your server is up and running!",
  });
});

app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/products", ProductRoutes);
app.use("/api/v1/cart", CartRoutes);
app.use("/api/v1/collections", CollectionController);
app.use("/api/v1/reviews", ReviewRoutes);
app.use("/api/v1/address", AddressRoutes);
app.use("/api/v1/orders", OrderController);

app.use(
  "*",
  (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    globalErrorHandler(err, req, res, next);
  }
);
app.listen(4000, () => {
  console.log("app is running at port 4000");
});
