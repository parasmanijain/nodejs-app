import express, {
  urlencoded,
  static as express_static,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";
import dotenv from "dotenv";
import { connect } from "mongoose";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import csrf from "csurf";
import flash from "connect-flash";
import multer, { diskStorage, Options } from "multer";
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

const isProd = process.env.NODE_ENV === "production";
const imagesDir = isProd
  ? join(__dirname, "images") // dist/images in production
  : join(process.cwd(), "src", "images"); // src/images in development

if (!existsSync(imagesDir)) {
  mkdirSync(imagesDir, { recursive: true });
  console.log(`Created images directory at: ${imagesDir}`);
}

const fileStorage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, imagesDir);
  },
  filename: (_req, file, cb) => {
    const safeDate = new Date().toISOString().replace(/:/g, "-");
    cb(null, `${safeDate}-${file.originalname}`);
  },
});

const fileFilter: Options["fileFilter"] = (_req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use(express_static(join(__dirname, "public")));
app.use("/images", express_static(imagesDir));
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

app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.isAuthenticated = req.session?.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

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
    console.log("Middleware error", err);
    if (err instanceof Error) {
      next(err);
    }
    next(new Error(String(err)));
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", get500);
app.use(get404);

app.use(
  (
    error: ErrorRequestHandler,
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.log("Global error", error);
    res.status(500).render("500", {
      pageTitle: "Error!",
      path: "/500",
      isAuthenticated: req.session?.isLoggedIn,
    });
  },
);

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
