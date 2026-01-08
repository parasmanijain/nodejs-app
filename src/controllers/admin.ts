import { NextFunction, Request, Response } from "express";
import { Product } from "../models/product";
import { ObjectId } from "mongodb";

export function getAddProduct(
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
}

export function postAddProduct(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const { title, imageUrl, price, description } = req.body;

  if (!req.user?._id) {
    res.redirect("/login");
    return;
  }

  const product = new Product(
    title,
    +price,
    description,
    imageUrl,
    null,
    req.user._id as ObjectId
  );

  product
    .save()
    .then(() => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => console.error(err));
}

export function getEditProduct(
  req: Request<{ productId: string }>,
  res: Response,
  _next: NextFunction
): void {
  const editMode = req.query.edit === "true";
  if (!editMode) {
    res.redirect("/");
    return;
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product,
      });
    })
    .catch((err) => console.error(err));
}

export function postEditProduct(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const { productId, title, price, imageUrl, description } = req.body;

  if (!req.user?._id) {
    res.redirect("/login");
    return;
  }

  const product = new Product(
    title,
    +price,
    description,
    imageUrl,
    productId,
    req.user._id as ObjectId
  );

  product
    .save()
    .then(() => {
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.error(err));
}

export function getProducts(
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  Product.fetchAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => console.error(err));
}

export function postDeleteProduct(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const prodId = req.body.productId;

  Product.deleteById(prodId)
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => console.error(err));
}
