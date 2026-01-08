import { Db, InsertOneResult, WithId, ObjectId } from "mongodb";
import { getDb } from "../util/database";

export interface ProductDocument {
  _id?: ObjectId;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
}

export class Product {
  title: string;
  price: number;
  description: string;
  imageUrl: string;

  constructor(
    title: string,
    price: number,
    description: string,
    imageUrl: string
  ) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  async save(): Promise<InsertOneResult<ProductDocument>> {
    const db: Db = getDb();
    try {
      const result = await db
        .collection<ProductDocument>("products")
        .insertOne(this);
      console.log(result);
      return result;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  static async fetchAll(): Promise<WithId<ProductDocument>[]> {
    const db: Db = getDb();
    try {
      const products = await db
        .collection<ProductDocument>("products")
        .find()
        .toArray();
      console.log(products);
      return products;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  static async findById(
    prodId: string
  ): Promise<WithId<ProductDocument> | null> {
    const db: Db = getDb();
    try {
      const product = await db
        .collection<ProductDocument>("products")
        .findOne({ _id: new ObjectId(prodId) });
      console.log(product);
      return product;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }
}
