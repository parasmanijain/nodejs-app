import { Router } from "express";
import isAuth from "../middleware/is-auth";
import {
  getCart,
  getIndex,
  getOrders,
  getProduct,
  getProducts,
  postCart,
  postCartDeleteProduct,
  postOrder,
} from "../controllers/shop";

export const router = Router();

router.get("/", getIndex);

router.get("/products", getProducts);

router.get("/products/:productId", getProduct);

router.get("/cart", isAuth, getCart);

router.post("/cart", isAuth, postCart);

router.post("/cart-delete-item", isAuth, postCartDeleteProduct);

router.post("/create-order", isAuth, postOrder);

router.get("/orders", isAuth, getOrders);
