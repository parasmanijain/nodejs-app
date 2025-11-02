import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("node-complete", "root", "gulshan1006", {
  dialect: "mysql",
  host: "localhost",
});