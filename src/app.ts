import express, {
  static as express_static,
  urlencoded,
  Response,
} from "express";
import path from "path";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(urlencoded({ extended: false }));
app.use(express_static(path.join(__dirname, "public")));

app.use(shopRoutes);
app.use("/admin", adminRoutes);

app.use((_, res: Response) => {
  res.status(404).render("404", { pageTitle: "Page Not Found", path: "/" });
});

app.listen(3000);
