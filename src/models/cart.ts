import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../util/database";

interface CartAttributes {
  id: number;
}

interface CartCreationAttributes extends Optional<CartAttributes, "id"> {}

class Cart
  extends Model<CartAttributes, CartCreationAttributes>
  implements CartAttributes
{
  public id!: number;

  // optional timestamps (if you have them enabled)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize, // connection instance
    tableName: "carts",
  }
);

export default Cart;
