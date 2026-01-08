import express, { urlencoded, static as express_static } from "express";
import { join } from "path";
import { mongoConnect } from "./util/database";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";
import { viewsPath } from "./util/path";
import { get404 } from "./controllers/error";

const app = express();
app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(urlencoded({ extended: false }));
app.use(express_static(join(__dirname, "public")));

app.use(shopRoutes);
app.use("/admin", adminRoutes);

app.use(get404);

app.use((req, res, next) => {});

mongoConnect((client) => {
  console.log(client);
  app.listen(3000);
});
