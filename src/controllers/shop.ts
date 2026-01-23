import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { Types } from "mongoose";
import { createReadStream } from "fs";
import PDFDocument from "pdfkit";
import { HttpError } from "../types/http-error";
import { Product } from "../models/product";
import { Order } from "../models/order";
import { CartItem } from "../models/user";

export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find();
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    if (!product) {
      res.redirect("/products");
      return;
    }
    res.render("shop/product-detail", {
      product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const getIndex = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find();
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products,
    });
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const postCart = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }
    const prodId: string = req.body.productId;
    const product = await Product.findById(prodId);
    if (!product) {
      res.redirect("/products");
      return;
    }
    await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const postCartDeleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }
    const prodId: string = req.body.productId;
    await req.user.removeFromCart(prodId);
    res.redirect("/cart");
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const postOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }
    const user = await req.user.populate("cart.items.productId");
    const products = user.cart.items.map((i: CartItem) => {
      const productDoc = i.productId as any;
      return {
        quantity: i.quantity,
        product: { ...productDoc._doc },
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user._id,
      },
      products,
    });
    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }
    const orders = await Order.find({
      "user.userId": req.user._id as Types.ObjectId,
    });
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders,
    });
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const getInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new Error("Unauthorized"));
    }
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new Error("No order found."));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = join("data", "invoices", invoiceName);
    const file = createReadStream(invoicePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"',
    );
    file.pipe(res);
  } catch (err) {
    next(err);
  }
};
