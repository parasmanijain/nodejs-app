import { Request, Response } from "express";
import { Cart } from "../models/cart";
import Product from "../models/product";

export const getProducts = (_: Request, res: Response) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getProduct = (req: Request, res: Response) => {
  const { productId } = req.params;
  Product.findByPk(productId)
    .then((product) => {
      if (product) {
        res.render("shop/product-detail", {
          product: product,
          pageTitle: product.title,
          path: "/products",
        });
      }
    })
    .catch((err) => console.log(err));
};

export const getIndex = (_: Request, res: Response) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
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
  const { productId } = req.body;
  Product.findById(productId, (product) => {
    if (product) {
      Cart.addProduct(productId, product.price);
    }
  });
  res.redirect("/cart");
};

export const postCartDeleteProduct = (req: Request, res: Response) => {
  const { productId } = req.body;
  Product.findById(productId, (product) => {
    if (product) {
      Cart.deleteProduct(productId, product.price);
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
