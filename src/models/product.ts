import { Db, InsertOneResult, WithId, Document } from "mongodb";
import { getDb } from "../util/database";

export interface ProductDocument {
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
      const result_1 = await db
        .collection<ProductDocument>("products")
        .insertOne(this);
      console.log(result_1);
      return result_1;
    } catch (err) {
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
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
