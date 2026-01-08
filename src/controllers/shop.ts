import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product";

export const getProducts = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.fetchAll();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  } catch (err: unknown) {
    console.error(err);
  }
};

export const getProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);

    if (!product) {
      res.status(404).render("404", {
        pageTitle: "Product Not Found",
        path: "/products",
      });
      return;
    }

    res.render("shop/product-detail", {
      product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err: unknown) {
    console.error(err);
  }
};

export const getIndex = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.fetchAll();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (err: unknown) {
    console.error(err);
  }
};
