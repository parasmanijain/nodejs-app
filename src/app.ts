import express, { static as express_static, Response } from "express";
import bodyParser from "body-parser";
import { join } from "path";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";

const app = express();
app.set("view engine", "pug");
app.set("views", join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express_static(join(__dirname, "public")));

app.use(shopRoutes);
app.use("/admin", adminRoutes);

app.use((req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page Not Found" });
});

app.listen(3000);
