import express, {
  urlencoded,
  static as express_static,
  Request,
  Response,
  NextFunction,
} from "express";
import { join } from "path";
import { mongoConnect } from "./util/database";
import { User } from "./models/user";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";
import { viewsPath } from "./util/path";
import { get404 } from "./controllers/error";

const app = express();
app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(urlencoded({ extended: false }));
app.use(express_static(join(__dirname, "public")));

app.use(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.findById("5baa2528563f16379fc8a610");
      req.user = user;
      next();
    } catch (err: unknown) {
      console.error(err);
    }
  }
);

app.use(shopRoutes);
app.use("/admin", adminRoutes);

app.use(get404);

mongoConnect((client) => {
  console.log(client);
  app.listen(3000);
});
