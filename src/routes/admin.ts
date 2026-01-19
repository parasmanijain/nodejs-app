import { Router } from "express";
import isAuth from "../middleware/is-auth";
import {
  getAddProduct,
  getEditProduct,
  getProducts,
  postAddProduct,
  postDeleteProduct,
  postEditProduct,
} from "../controllers/admin";

export const router = Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, getProducts);

// /admin/add-product => POST
router.post("/add-product", isAuth, postAddProduct);

router.get("/edit-product/:productId", isAuth, getEditProduct);

router.post("/edit-product", isAuth, postEditProduct);

router.post("/delete-product", isAuth, postDeleteProduct);
