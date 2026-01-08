import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_DATABASE } =
  process.env;

if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_HOST || !MONGODB_DATABASE) {
  throw new Error("Missing MongoDB environment variables");
}

const MONGODB_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

let _db: Db;

type MongoCallback = (client: MongoClient) => void;

export const mongoConnect = (callback: MongoCallback): void => {
  MongoClient.connect(MONGODB_URI)
    .then((client) => {
      console.log("Connected to MongoDB!");
      _db = client.db(MONGODB_DATABASE);
      callback(client);
    })
    .catch((err: unknown) => {
      console.error("MongoDB connection failed:", err);
      throw err;
    });
};

export const getDb = (): Db => {
  if (!_db) {
    throw new Error("No database found!");
  }
  return _db;
};
