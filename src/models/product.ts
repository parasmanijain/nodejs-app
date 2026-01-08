import {
  Db,
  ObjectId,
  WithId,
  InsertOneResult,
  UpdateResult,
  DeleteResult,
} from "mongodb";
import { getDb } from "../util/database";

export interface ProductDocument {
  _id?: ObjectId;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
}

export class Product {
  _id: ObjectId | null;
  title: string;
  price: number;
  description: string;
  imageUrl: string;

  constructor(
    title: string,
    price: number,
    description: string,
    imageUrl: string,
    id?: string
  ) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
  }

  async save(): Promise<InsertOneResult<ProductDocument> | UpdateResult> {
    const db: Db = getDb();

    if (this._id) {
      return db.collection<ProductDocument>("products").updateOne(
        { _id: this._id },
        {
          $set: {
            title: this.title,
            price: this.price,
            description: this.description,
            imageUrl: this.imageUrl,
          },
        }
      );
    }

    return db.collection<ProductDocument>("products").insertOne({
      title: this.title,
      price: this.price,
      description: this.description,
      imageUrl: this.imageUrl,
    });
  }

  static async fetchAll(): Promise<WithId<ProductDocument>[]> {
    const db: Db = getDb();
    return db.collection<ProductDocument>("products").find().toArray();
  }

  static async findById(
    prodId: string
  ): Promise<WithId<ProductDocument> | null> {
    const db: Db = getDb();
    return db
      .collection<ProductDocument>("products")
      .findOne({ _id: new ObjectId(prodId) });
  }

  static async deleteById(prodId: string): Promise<DeleteResult> {
    const db: Db = getDb();
    return db
      .collection<ProductDocument>("products")
      .deleteOne({ _id: new ObjectId(prodId) });
  }
}
