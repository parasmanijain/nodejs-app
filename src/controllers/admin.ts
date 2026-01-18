import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product";

export const getAddProduct = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isAuthenticated: req.isLoggedIn,
  });
};

export const postAddProduct = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const { title, imageUrl, price, description } = req.body;
    if (!req.user) {
      res.redirect("/login");
      return;
    }
    const product = new Product({
      title,
      price: Number(price),
      description,
      imageUrl,
      userId: req.user._id,
    });

    await product.save();

    console.log("Created Product");
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
  }
};

export const getEditProduct = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const editMode = req.query.edit;

    if (!editMode) {
      res.redirect("/");
      return;
    }

    const prodId = req.params.productId;

    const product = await Product.findById(prodId);

    if (!product) {
      res.redirect("/");
      return;
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: Boolean(editMode),
      product,
      isAuthenticated: req.isLoggedIn,
    });
  } catch (err) {
    console.error(err);
  }
};

export const postEditProduct = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const { productId, title, price, imageUrl, description } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      res.redirect("/");
      return;
    }
    product.title = title;
    product.price = Number(price);
    product.description = description;
    product.imageUrl = imageUrl;

    await product.save();

    console.log("UPDATED PRODUCT!");
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find();
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
      isAuthenticated: req.isLoggedIn,
    });
  } catch (err) {
    console.error(err);
  }
};

export const postDeleteProduct = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.body;
    await Product.findByIdAndDelete(productId);
    console.log("DESTROYED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
  }
};
