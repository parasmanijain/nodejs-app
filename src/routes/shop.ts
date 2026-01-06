import { Router, Response } from "express";
import { products } from "./admin";

export const router = Router();

router.get("/", (_, res: Response) => {
  res.render("shop", { prods: products, pageTitle: "Shop", path: "/" });
});
