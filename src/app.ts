import express, {
  Response,
  static as express_static,
  urlencoded,
} from "express";
import path from "path";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";
import { viewsPath } from "./util/path";

const app = express();
app.use(urlencoded({ extended: false }));
app.use(express_static(path.join(__dirname, "public")));

app.use(shopRoutes);
app.use("/admin", adminRoutes);

app.use((_, res: Response) => {
  res.status(404).sendFile(path.join(viewsPath, "404.html"));
});

app.listen(3000);
