import express, { NextFunction, Request, Response } from "express";
import AdminRoutes from "./src/admin/routes/index.routes";
import AuthRoutes from "./src/app/routes/auth.routes";
import UserRoutes from "./src/app/routes/user.routes";
import ProductRoutes from "./src/app/routes/products.routes";
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
  res.send("hello world!");
});
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/user", UserRoutes);
app.use("/api/v1/auth", AuthRoutes);
app.use("/api/v1/products", ProductRoutes);

app.use(
  "*",
  (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    globalErrorHandler(err, req, res, next);
  }
);
app.listen(4000, () => {
  console.log("app is running at port 4000");
});
