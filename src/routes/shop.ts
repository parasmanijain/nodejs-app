import express, { Response } from "express";
import { getCart, getCheckout, getIndex, getOrders, getProducts } from "../controllers/shop";

export const router = express.Router();

router.get('/', getIndex);

router.get('/products', getProducts);

router.get('/cart', getCart);

router.get('/orders', getOrders);

router.get('/checkout', getCheckout);