import { NextFunction, Request, Response } from "express";
import Product from "../models/product";
import Cart from "../models/cart";

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

export const getCart = (req: Request, res: Response) => {
  if (req.user) {
    req.user
      .getCart()
      .then((cart) => {
        return cart
          .getProducts()
          .then((products) => {
            res.render("shop/cart", {
              path: "/cart",
              pageTitle: "Your Cart",
              products: products,
            });
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
};

export const postCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId: number = +req.body.productId;
  let fetchedCart: typeof req.user extends { getCart: () => Promise<infer C> }
    ? C
    : any;
  let newQuantity = 1;
  try {
    if (!req.user) {
      return res.status(401).send("User not found");
    }
    // Get the user's cart
    fetchedCart = await req.user.getCart();

    // Check if the product is already in the cart
    const productsInCart = await fetchedCart.getProducts({
      where: { id: prodId },
    });

    let product: Product | null = null;

    if (productsInCart.length > 0) {
      product = productsInCart[0];
      const oldQuantity: number = product?.cartItem?.quantity ?? 0;
      newQuantity = oldQuantity + 1;
    } else {
      product = await Product.findByPk(prodId);
    }

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Add product to cart with quantity
    await fetchedCart.addProduct(product, {
      through: { quantity: newQuantity },
    });

    res.redirect("/cart");
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const postCartDeleteProduct = (req: Request, res: Response) => {
  const { productId } = req.body;
  if (req.user) {
    req.user
      .getCart()
      .then((cart) => {
        return cart.getProducts({ where: { id: productId } });
      })
      .then((products) => {
        const product = products[0];
        return product.cartItem?.destroy();
      })
      .then((result) => {
        res.redirect("/cart");
      })
      .catch((err) => console.log(err));
  }
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
