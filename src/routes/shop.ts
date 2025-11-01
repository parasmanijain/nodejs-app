import express from "express";
import {
  getCart,
  getCheckout,
  getIndex,
  getOrders,
  getProduct,
  getProducts,
} from "../controllers/shop";

export const router = express.Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/cart", getCart);

router.get("/orders", getOrders);

router.get("/checkout", getCheckout);
