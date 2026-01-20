import { Request, Response, NextFunction } from "express";
import { Product } from "../models/product";
import { validationResult } from "express-validator";

export const getAddProduct = (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

export const postAddProduct = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    const { title, imageUrl, price, description } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/edit-product",
        editing: false,
        hasError: true,
        product: {
          title: title,
          imageUrl: imageUrl,
          price: price,
          description: description,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
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
      hasError: false,
      errorMessage: null,
      validationErrors: [],
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
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        hasError: true,
        product: {
          title,
          imageUrl,
          price,
          description,
          _id: productId,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }

    const product = await Product.findById(productId);
    if (!product || product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
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
    const products = await Product.find({ userId: req.user._id });
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
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
    await Product.deleteOne({ _id: productId, userId: req.user._id });
    console.log("DESTROYED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
  }
};
