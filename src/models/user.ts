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
  _id?: ObjectId;
  name: string;
  email: string;
  cart: Cart;
}

export interface Product {
  _id: ObjectId;
}

export class User {
  _id?: ObjectId;
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
      name: this.name,
      email: this.email,
      cart: this.cart,
    });
  }

  addToCart(product: Product): Promise<UpdateResult> {
    if (!this._id) {
      throw new Error("User must have an _id to update cart");
    }

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

  // Find user by ID
  static async findById(userId: string): Promise<User | null> {
    const db: Db = getDb();
    try {
      const userDoc: WithId<UserDocument> | null = await db
        .collection<UserDocument>("users")
        .findOne({ _id: new ObjectId(userId) });

      if (!userDoc) return null;

      return new User(userDoc.name, userDoc.email, userDoc.cart, userDoc._id);
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }
}
