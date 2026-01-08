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
  } catch (err) {
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
  } catch (err) {
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
  } catch (err) {
    console.error(err);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const products = await req.user!.getCart();

    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products,
    });
  } catch (err) {
    console.error(err);
  }
};

export const postCart = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);

    if (!product) {
      res.redirect("/products");
      return;
    }

    await req.user!.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
  }
};

export const postCartDeleteProduct = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const prodId = req.body.productId;
    await req.user!.deleteItemFromCart(prodId);
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
  }
};

export const postOrder = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    await req.user!.addOrder();
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const orders = await req.user!.getOrders();

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders,
    });
  } catch (err) {
    console.error(err);
  }
};
