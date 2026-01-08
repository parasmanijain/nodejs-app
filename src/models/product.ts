import { Schema, model, Document, Types } from "mongoose";

export interface ProductDocument extends Document {
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  userId: Types.ObjectId;
}

const productSchema = new Schema<ProductDocument>({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Product = model<ProductDocument>("Product", productSchema);
