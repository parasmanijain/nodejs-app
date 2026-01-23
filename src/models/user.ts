import { Schema, model, Document, Types } from "mongoose";
import { ProductDocument } from "./product";

export interface CartItem {
  productId: Types.ObjectId;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface User {
  password: string;
  email: string;
  resetToken?: string;
  resetTokenExpiration?: number;
  cart: Cart;
}

export type UserDocument = User &
  Document & {
    addToCart(product: ProductDocument): Promise<UserDocument>;
    removeFromCart(productId: Types.ObjectId): Promise<UserDocument>;
    clearCart(): Promise<UserDocument>;
  };

const userSchema = new Schema<UserDocument>({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (
  this: UserDocument,
  product: { _id: Types.ObjectId },
) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  this.cart = { items: updatedCartItems };
  return this.save();
};

userSchema.methods.removeFromCart = function (
  this: UserDocument,
  productId: Types.ObjectId,
) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function (this: UserDocument) {
  this.cart = { items: [] };
  return this.save();
};

export const User = model<UserDocument>("User", userSchema);
