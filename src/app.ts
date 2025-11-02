import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";
import { viewsPath } from "./util/path";
import { get404 } from "./controllers/error";
import { db } from "./util/database";

const app = express();
app.set("view engine", "ejs");
app.set("views", viewsPath);

db.execute("SELECT * FROM products")
  .then((result) => {
    console.log(result[0], result[1]);
  })
  .catch((err) => {
    console.log(err);
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(shopRoutes);
app.use("/admin", adminRoutes);

app.use(get404);

app.listen(3000);
