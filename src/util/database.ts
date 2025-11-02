import mysql from "mysql2";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "node-complete",
  password: "gulshan1006",
});

export const db = pool.promise();
