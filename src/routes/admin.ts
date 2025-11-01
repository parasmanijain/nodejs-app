import express from "express";
import {
  getAddProduct,
  getEditProduct,
  getProducts,
  postAddProduct,
} from "../controllers/admin";

export const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", getAddProduct);

// /admin/products => GET
router.get("/products", getProducts);

// /admin/add-product => POST
router.post("/add-product", postAddProduct);

router.get("/edit-product/:productId", getEditProduct);
