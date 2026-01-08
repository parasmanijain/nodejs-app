import { Db, ObjectId, WithId, InsertOneResult, UpdateResult } from "mongodb";
import { getDb } from "../util/database";

export interface CartItem {
  productId: ObjectId;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  cart: Cart;
}

export interface Product {
  _id: ObjectId;
}

export interface ProductDocument {
  _id: ObjectId;
  title?: string;
  price?: number;
}

export interface CartProduct extends ProductDocument {
  quantity: number;
}

export interface OrderDocument {
  _id?: ObjectId;
  items: CartProduct[];
  user: {
    _id: ObjectId;
    name: string;
  };
}

export class User {
  _id!: ObjectId;
  name: string;
  email: string;
  cart: Cart;

  constructor(
    username: string,
    email: string,
    cart: Cart = { items: [] },
    id?: string | ObjectId
  ) {
    this.name = username;
    this.email = email;
    this.cart = cart;

    if (id) {
      this._id = typeof id === "string" ? new ObjectId(id) : id;
    }
  }

  save(): Promise<InsertOneResult<UserDocument>> {
    const db: Db = getDb();
    return db.collection<UserDocument>("users").insertOne({
      _id: this._id,
      name: this.name,
      email: this.email,
      cart: this.cart,
    });
  }

  addToCart(product: Product): Promise<UpdateResult> {
    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product._id.toString()
    );
    const updatedCartItems = [...this.cart.items];
    let newQuantity = 1;
    if (cartProductIndex >= 0) {
      newQuantity = updatedCartItems[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }
    const updatedCart: Cart = { items: updatedCartItems };
    const db: Db = getDb();
    return db
      .collection<UserDocument>("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  async getCart(): Promise<CartProduct[]> {
    const db: Db = getDb();
    const productIds = this.cart.items.map((i) => i.productId);
    const products = await db
      .collection<ProductDocument>("products")
      .find({ _id: { $in: productIds } })
      .toArray();
    return products.map((p) => {
      const cartItem = this.cart.items.find(
        (i) => i.productId.toString() === p._id.toString()
      );
      return {
        ...p,
        quantity: cartItem ? cartItem.quantity : 0,
      };
    });
  }

  deleteItemFromCart(productId: string): Promise<UpdateResult> {
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    const db: Db = getDb();
    return db
      .collection<UserDocument>("users")
      .updateOne(
        { _id: this._id },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  async addOrder(): Promise<UpdateResult> {
    const db: Db = getDb();
    const products = await this.getCart();
    const order: OrderDocument = {
      items: products,
      user: {
        _id: this._id,
        name: this.name,
      },
    };
    await db.collection<OrderDocument>("orders").insertOne(order);
    this.cart = { items: [] };
    return db
      .collection<UserDocument>("users")
      .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
  }

  getOrders(): Promise<OrderDocument[]> {
    const db: Db = getDb();
    return db
      .collection<OrderDocument>("orders")
      .find({ "user._id": this._id })
      .toArray();
  }

  static async findById(userId: string): Promise<User | null> {
    const db: Db = getDb();
    const userDoc = await db
      .collection<UserDocument>("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!userDoc) return null;
    return new User(userDoc.name, userDoc.email, userDoc.cart, userDoc._id);
  }
}
