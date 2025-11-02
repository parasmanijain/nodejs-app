import { Request, Response } from "express";
import Product from "../models/product";

export const getAddProduct = (_: Request, res: Response) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

export const postAddProduct = (req: Request, res: Response) => {
  if (req.user) {
    const { title, imageUrl, description, price } = req.body;
    req.user
      .createProduct({
        title,
        price,
        imageUrl,
        description,
      })
      .then(() => {
        // console.log(result);
        console.log("Created Product");
        res.redirect("/admin/products");
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
};

export const getEditProduct = (req: Request, res: Response) => {
  const { edit } = req.query;
  if (!edit) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  if (req.user) {
    req.user
      .getProducts({ where: { id: prodId } })
      // Product.findById(prodId)
      .then((products) => {
        const product = products[0];
        if (!product) {
          return res.redirect("/");
        }
        res.render("admin/edit-product", {
          pageTitle: "Edit Product",
          path: "/admin/edit-product",
          editing: edit,
          product: product,
        });
      })
      .catch((err) => console.log(err));
  }
};

export const postEditProduct = (req: Request, res: Response) => {
  const { productId, title, price, imageUrl, description } = req.body;
  Product.findByPk(productId)
    .then((product) => {
      if (product) {
        product.title = title;
        product.price = price;
        product.description = description;
        product.imageUrl = imageUrl;
        return product.save();
      }
    })
    .then(() => {
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

export const getProducts = (req: Request, res: Response) => {
  if (req.user) {
    req.user
      .getProducts()
      .then((products) => {
        res.render("admin/products", {
          prods: products,
          pageTitle: "Admin Products",
          path: "/admin/products",
        });
      })
      .catch((err) => console.log(err));
  }
};

export const postDeleteProduct = (req: Request, res: Response) => {
  const { productId } = req.body;
  Product.findByPk(productId)
    .then((product) => {
      if (product) {
        return product.destroy();
      }
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};
