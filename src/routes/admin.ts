import { Router, Request, Response } from "express";

export const router = Router();

export let products: Array<Record<string, any>> = [];

// /admin/add-product => GET
router.get("/add-product", (_, res: Response) => {
  res.render("add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
  });
});

// /admin/add-product => POST
router.post("/add-product", (req: Request, res: Response) => {
  products.push({ title: req.body.title });
  res.redirect("/");
});
