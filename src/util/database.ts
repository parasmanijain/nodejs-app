import { MongoClient } from "mongodb";

const MONGODB_URI =
  "mongodb+srv://maximilian:9u4biljMQc4jjqbe@cluster0-ntrwp.mongodb.net/test?retryWrites=true";

type MongoCallback = (client: MongoClient) => void;

export const mongoConnect = (callback: MongoCallback): void => {
  MongoClient.connect(MONGODB_URI)
    .then((client) => {
      console.log("Connected!");
      callback(client);
    })
    .catch((err: unknown) => {
      console.error(err);
    });
};
