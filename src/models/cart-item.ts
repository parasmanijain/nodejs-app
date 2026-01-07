import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../util/database";

interface CartItemAttributes {
  id: number;
  quantity?: number;
}

interface CartItemCreationAttributes
  extends Optional<CartItemAttributes, "id"> {}

class CartItem
  extends Model<CartItemAttributes, CartItemCreationAttributes>
  implements CartItemAttributes
{
  public id!: number;
  public quantity?: number;
}

CartItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "cartItem",
    timestamps: false,
  }
);

export default CartItem;
