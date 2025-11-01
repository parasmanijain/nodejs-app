import { Request, Response } from "express";
import { Product } from "../models/product";
import { Cart } from "../models/cart";

export const getProducts = (_: Request, res: Response) => {
  Product.fetchAll((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

export const getProduct = (req: Request, res: Response) => {
  const prodId = req.params.productId;
  Product.findById(prodId, (product) => {
    if (product) {
      res.render("shop/product-detail", {
        product,
        pageTitle: product.title,
        path: "/products",
      });
    }
  });
};

export const getIndex = (_: Request, res: Response) => {
  Product.fetchAll((products) => {
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  });
};

export const getCart = (_: Request, res: Response) => {
  Cart.getCart((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = [];
      for (let product of products) {
        const cartProductData = cart.products.find(
          (prod) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartProducts,
      });
    });
  });
};

export const postCart = (req: Request, res: Response) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    if (product) {
      Cart.addProduct(prodId, product.price);
    }
  });
  res.redirect("/cart");
};

export const postCartDeleteProduct = (req: Request, res: Response) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    if (product) {
      Cart.deleteProduct(prodId, product.price);
      res.redirect("/cart");
    }
  });
};

export const getOrders = (_: Request, res: Response) => {
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

export const getCheckout = (_: Request, res: Response) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
