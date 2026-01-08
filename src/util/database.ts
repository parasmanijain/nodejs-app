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

export const mongoConnect = async () => {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log("✅ Connected to MongoDB Atlas");
  _db = client.db(MONGODB_DATABASE);
};

export const getDb = (): Db => {
  if (!_db) throw new Error("Database not initialized");
  return _db;
};
