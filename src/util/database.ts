import { MongoClient, Db } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://maximilian:9u4biljMQc4jjqbe@cluster0-ntrwp.mongodb.net/test?retryWrites=true";

let _db: Db;

type MongoCallback = (client: MongoClient) => void;

export const mongoConnect = (callback: MongoCallback): void => {
  MongoClient.connect(MONGODB_URI)
    .then((client) => {
      console.log("Connected!");
      _db = client.db(); // default DB from URI
      callback(client);
    })
    .catch((err: unknown) => {
      console.error(err);
      throw err;
    });
};

export const getDb = (): Db => {
  if (_db) {
    return _db;
  }
  throw new Error("No database found!");
};
