import express, {
  urlencoded,
  static as express_static,
  Response,
} from "express";
import { join } from "path";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";
import { viewsPath } from "./util/path";

const app = express();
app.set("views", join(__dirname, "views"));

app.use(urlencoded({ extended: false }));
app.use(express_static(join(__dirname, "public")));

app.use(shopRoutes);
app.use("/admin", adminRoutes);

app.use((_, res: Response) => {
  res.status(404).sendFile(join(viewsPath, "404.html"));
});

app.listen(3000);
