import { config } from "dotenv";
config(); // MUST be first

import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE as string,
  process.env.MYSQL_USERNAME as string,
  process.env.MYSQL_PASSWORD as string,
  {
    dialect: "mysql",
    host: "localhost",
  }
);
