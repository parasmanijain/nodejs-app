import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { basename } from "path";
import { HttpError } from "../types/http-error";
import { Product } from "../models/product";
import { deleteFile } from "../util/file";

interface AddProductBody {
  title: string;
  price: string;
  description: string;
}

interface EditProductBody extends AddProductBody {
  productId: string;
  imageUrl?: string;
}

export const getAddProduct = (
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
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
  req: Request<{}, {}, AddProductBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, price, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);
    if (!image) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: true,
        product: { title, price, description },
        errorMessage: "Attached file is not an image.",
        validationErrors: [],
      });
    }

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/edit-product",
        editing: false,
        hasError: true,
        product: {
          title,
          price,
          description,
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
      imageUrl: `/images/${basename(image.path)}`,
      userId: req.user._id,
    });
    await product.save();
    console.log("Created Product");
    res.redirect("/admin/products");
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const getEditProduct = async (
  req: Request<{ productId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const editMode = req.query.edit === "true";
    if (!editMode) {
      res.redirect("/");
      return;
    }
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.redirect("/");
      return;
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const postEditProduct = async (
  req: Request<{}, {}, EditProductBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId, title, price, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        hasError: true,
        product: {
          _id: productId,
          title,
          price,
          description,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
    if (!req.user) {
      res.redirect("/login");
      return;
    }

    const product = await Product.findById(productId);
    if (!product || product.userId.toString() !== req.user._id.toString()) {
      res.redirect("/");
      return;
    }
    product.title = title;
    product.price = Number(price);
    product.description = description;
    if (image) {
      deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    console.log("UPDATED PRODUCT!");
    res.redirect("/admin/products");
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }
    const products = await Product.find({ userId: req.user._id });
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};

export const postDeleteProduct = async (
  req: Request<{}, {}, { productId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.redirect("/login");
      return;
    }
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return next(new Error("Product not found."));
    }
    if (product.userId.toString() !== req.user._id.toString()) {
      res.redirect("/");
      return;
    }
    deleteFile(product.imageUrl);
    await Product.deleteOne({
      _id: req.body.productId,
      userId: req.user._id,
    });
    console.log("DESTROYED PRODUCT");
    res.redirect("/admin/products");
  } catch (err) {
    const error: HttpError = new Error(
      err instanceof Error ? err.message : String(err),
    );
    error.httpStatusCode = 500;
    next(error);
  }
};
