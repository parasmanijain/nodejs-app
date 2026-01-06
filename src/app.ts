import express, {
  static as express_static,
  urlencoded,
  NextFunction,
  Request,
} from "express";
import path from "path";
import { router as adminRoutes } from "./routes/admin";
import { router as shopRoutes } from "./routes/shop";
import { viewsPath } from "./util/path";
import { get404 } from "./controllers/error";
import { sequelize } from "./util/database";
import Product from "./models/product";
import User from "./models/user";
import Cart from "./models/cart";
import CartItem from "./models/cart-item";
import Order from "./models/order";
import OrderItem from "./models/order-item";

const app = express();
app.set("view engine", "ejs");
app.set("views", viewsPath);

app.use(urlencoded({ extended: false }));
app.use(express_static(path.join(__dirname, "public")));

app.use((req: Request, _, next: NextFunction) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user || undefined;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  .sync({ force: true })
  .then(() => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Paras", email: "test@test.com" });
    }
    return user;
  })
  .then((user) => {
    // console.log(user);
    return user.createCart();
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
