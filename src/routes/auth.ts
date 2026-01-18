import { Router } from "express";
import { getLogin } from "../controllers/auth";

export const router = Router();

router.get("/login", getLogin);
