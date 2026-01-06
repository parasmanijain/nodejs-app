import { Router } from "express";
import {
  getCart,
  getCheckout,
  getIndex,
  getOrders,
  getProduct,
  getProducts,
  postCart,
  postCartDeleteProduct,
} from "../controllers/shop";

export const router = Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/cart", getCart);

router.post("/cart", postCart);

router.post("/cart-delete-item", postCartDeleteProduct);

router.get("/orders", getOrders);

router.get("/checkout", getCheckout);
