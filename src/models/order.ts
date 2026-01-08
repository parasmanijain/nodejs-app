import { Schema, model, Document, Types } from "mongoose";

export interface OrderProduct {
  product: any;
  quantity: number;
}

export interface OrderUser {
  name: string;
  userId: Types.ObjectId;
}

export interface OrderDocument extends Document {
  products: OrderProduct[];
  user: OrderUser;
}

const orderSchema = new Schema<OrderDocument>({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
});

export const Order = model<OrderDocument>("Order", orderSchema);
