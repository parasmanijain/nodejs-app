import { Router, Response } from "express";
import { join } from "path";
import { viewsPath } from "../util/path";

export const router = Router();

router.get("/", (_, res: Response) => {
  res.sendFile(join(viewsPath, "shop.html"));
});
