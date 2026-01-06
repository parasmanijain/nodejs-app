import { Router, Request, Response } from "express";
import { join } from "path";
import { viewsPath } from "../util/path";

export const router = Router();

export let products: Array<Record<string, any>> = [];

// /admin/add-product => GET
router.get("/add-product", (_, res: Response) => {
  res.sendFile(join(viewsPath, "add-product.html"));
});

// /admin/add-product => POST
router.post("/add-product", (req: Request, res: Response) => {
  products.push({ title: req.body.title });
  res.redirect("/");
});
