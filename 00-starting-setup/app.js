import { join } from "path";
import express, { urlencoded, static as express_static } from "express";
import { get404 } from "./controllers/error";
import { sync } from "./util/database";
import Product, { belongsTo, belongsToMany } from "./models/product";
import User, { findById, hasMany, hasOne, create } from "./models/user";
import Cart, {
  belongsTo as _belongsTo,
  belongsToMany as _belongsToMany,
} from "./models/cart";
import CartItem from "./models/cart-item";
import Order, {
  belongsTo as __belongsTo,
  belongsToMany as __belongsToMany,
} from "./models/order";
import OrderItem from "./models/order-item";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

import adminRoutes from "./routes/admin";
import shopRoutes from "./routes/shop";

app.use(urlencoded({ extended: false }));
app.use(express_static(join(__dirname, "public")));

app.use((req, res, next) => {
  findById(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(get404);

belongsTo(User, { constraints: true, onDelete: "CASCADE" });
hasMany(Product);
hasOne(Cart);
_belongsTo(User);
_belongsToMany(Product, { through: CartItem });
belongsToMany(Cart, { through: CartItem });
__belongsTo(User);
hasMany(Order);
__belongsToMany(Product, { through: OrderItem });

sync()
  .then((result) => {
    return findById(1);
    // console.log(result);
  })
  .then((user) => {
    if (!user) {
      return create({ name: "Max", email: "test@test.com" });
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
