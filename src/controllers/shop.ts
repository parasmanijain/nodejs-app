import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product";
import { Order } from "../models/order";
import { CartItem } from "../models/user";

export const getProducts = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find();

    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.error(err);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  _next: NextFunction,
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
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.error(err);
  }
};

export const getIndex = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find();

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
  _next: NextFunction,
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
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.error(err);
  }
};

export const postCart = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }

    const prodId = req.body.productId;
    const product = await Product.findById(prodId);

    if (!product) {
      res.redirect("/products");
      return;
    }

    await req.user.addToCart(product);

    res.redirect("/cart");
  } catch (err) {
    console.error(err);
  }
};

export const postCartDeleteProduct = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }

    const prodId = req.body.productId;

    await req.user.removeFromCart(prodId);

    res.redirect("/cart");
  } catch (err) {
    console.error(err);
  }
};

export const postOrder = async (
  req: Request,
  res: Response,
  _next: NextFunction,
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
        name: req.user.name,
        userId: req.user._id,
      },
      products,
    });

    await order.save();
    await req.user.clearCart();

    res.redirect("/orders");
  } catch (err) {
    console.error(err);
  }
};

export const getOrders = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }

    const orders = await Order.find({ "user.userId": req.user._id });

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders,
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    console.error(err);
  }
};
