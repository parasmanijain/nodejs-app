import { Request, Response, NextFunction } from "express";
import { join } from "path";
import { Types } from "mongoose";
import { createWriteStream } from "fs";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import Stripe from "stripe";
import { HttpError } from "../types/http-error";
import { invoicesDir } from "../util/path";
import { Product, ProductDocument } from "../models/product";
import { Order } from "../models/order";
import { CartItem } from "../models/user";

dotenv.config();

const { STRIPE_API_KEY } = process.env;

const ITEMS_PER_PAGE = 2;

// Interface for populated cart items
interface PopulatedCartItem {
  productId: ProductDocument;
  quantity: number;
}

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentPage = req.query.page ? Number(req.query.page) : 1;
    const totalItems = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((currentPage - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      currentPage,
      hasNextPage: ITEMS_PER_PAGE * currentPage < totalItems,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const totalProducts = await Product.find().countDocuments();
    const currentPage = req.query.page ? Number(req.query.page) : 1;
    const products = await Product.find()
      .skip((currentPage - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
      totalProducts,
      currentPage,
      hasNextPage: ITEMS_PER_PAGE * currentPage < totalProducts,
      hasPreviousPage: currentPage > 1,
      nextPage: currentPage + 1,
      previousPage: currentPage - 1,
      lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
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
    const invoicePath = join(invoicesDir, invoiceName);
    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"',
    );
    pdfDoc.pipe(createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true,
    });
    pdfDoc.text("-----------------------");
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(14)
        .text(
          prod.product.title +
            " - " +
            prod.quantity +
            " x " +
            "$" +
            prod.product.price,
        );
    });
    pdfDoc.text("---");
    pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
    pdfDoc.end();
  } catch (err) {
    next(err);
  }
};

export const getCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!STRIPE_API_KEY || !req.user) return;
    const stripe = new Stripe(STRIPE_API_KEY);
    const user = await req.user.populate<{
      cart: { items: PopulatedCartItem[] };
    }>("cart.items.productId");
    let total = 0;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: user.cart.items.map((item: PopulatedCartItem) => {
        total += item.quantity * item.productId.price;
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.productId.title,
              description: item.productId.description,
            },
            unit_amount: item.productId.price * 100,
          },
          quantity: item.quantity,
        };
      }),
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
      cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
    });
    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      products: user.cart.items,
      totalSum: total,
      sessionId: session.id,
    });
  } catch (err) {
    const error: HttpError = new Error(String(err));
    error.httpStatusCode = 500;
    next(error);
  }
};

export const getCheckoutSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) return;
    const user = await req.user.populate<{
      cart: { items: PopulatedCartItem[] };
    }>("cart.items.productId");
    const products = user.cart.items.map((item: PopulatedCartItem) => ({
      quantity: item.quantity,
      product: item.productId.toObject(),
    }));
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
    const error: HttpError = new Error(String(err));
    error.httpStatusCode = 500;
    next(error);
  }
};
