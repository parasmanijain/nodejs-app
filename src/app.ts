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
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import csrf from "csurf";
import flash from "connect-flash";
import { User } from "./models/user";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";
import { router as authRoutes } from "./routes/auth";
import { viewsPath } from "./util/path";
import { get404, get500 } from "./controllers/error";

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

const MongoDBStore = connectMongoDBSession(session);

const MONGO_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(urlencoded({ extended: false }));
app.use(express_static(join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store,
  }),
);

app.use(csrfProtection);
app.use(flash());

app.use(async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (!req.session.userId) {
      return next();
    }
    const user = await User.findById(req.session.userId);
    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    console.error(err);
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", get500);
app.use(get404);

async function startServer() {
  try {
    await connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(Number(PORT), () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}
startServer();
