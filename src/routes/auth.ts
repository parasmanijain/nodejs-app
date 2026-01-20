import { Router } from "express";
import {
  getLogin,
  getNewPassword,
  getReset,
  getSignup,
  postLogin,
  postLogout,
  postNewPassword,
  postReset,
  postSignup,
} from "../controllers/auth";

export const router = Router();

router.get("/login", getLogin);

router.get("/signup", getSignup);

router.post("/login", postLogin);

router.post("/signup", postSignup);

router.post("/logout", postLogout);

router.get("/reset", getReset);

router.post("/reset", postReset);

router.get("/reset/:token", getNewPassword);

router.post("/new-password", postNewPassword);
