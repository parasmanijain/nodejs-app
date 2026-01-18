import express, {
  urlencoded,
  static as express_static,
  Request,
  Response,
  NextFunction,
} from "express";
import { join } from "path";
import dotenv from "dotenv";
import { connect } from "mongoose";
import { User } from "./models/user";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";
import { router as authRoutes } from "./routes/auth";
import { viewsPath } from "./util/path";
import { get404 } from "./controllers/error";

dotenv.config();

const {
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_HOST,
  MONGODB_DATABASE,
  PORT = "3000",
} = process.env;

if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_HOST || !MONGODB_DATABASE) {
  throw new Error("Missing MongoDB environment variables");
}

const app = express();

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(urlencoded({ extended: false }));
app.use(express_static(join(__dirname, "public")));

app.use(async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = await User.findById("695f6b6871f02ca372daac24");
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    console.error(err);
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(get404);

const MONGO_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

async function startServer() {
  try {
    await connect(MONGO_URI);
    console.log("MongoDB connected");
    const existingUser = await User.findOne();
    if (!existingUser) {
      const user = new User({
        name: "Paras",
        email: "test@test.com",
        cart: { items: [] },
      });
      await user.save();
    }
    app.listen(Number(PORT), () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}
startServer();
