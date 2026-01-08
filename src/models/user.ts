import { Db, ObjectId, WithId, InsertOneResult } from "mongodb";
import { getDb } from "../util/database";

export interface UserDocument {
  _id?: ObjectId;
  name: string;
  email: string;
}

export class User {
  _id?: ObjectId;
  name: string;
  email: string;

  constructor(username: string, email: string, id?: string | ObjectId) {
    this.name = username;
    this.email = email;

    if (id) {
      this._id = typeof id === "string" ? new ObjectId(id) : id;
    }
  }

  save(): Promise<InsertOneResult<UserDocument>> {
    const db: Db = getDb();
    return db.collection<UserDocument>("users").insertOne({
      name: this.name,
      email: this.email,
    });
  }

  static async findById(userId: string): Promise<WithId<UserDocument> | null> {
    const db: Db = getDb();
    try {
      const user = await db
        .collection<UserDocument>("users")
        .findOne({ _id: new ObjectId(userId) });
      console.log(user);
      return user;
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }
}
