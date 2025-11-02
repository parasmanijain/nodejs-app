import {
  DataTypes,
  Model,
  Optional,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
} from "sequelize";
import { sequelize } from "../util/database";
import Product from "./product";

interface CartAttributes {
  id: number;
}

interface CartCreationAttributes extends Optional<CartAttributes, "id"> {}

class Cart
  extends Model<CartAttributes, CartCreationAttributes>
  implements CartAttributes
{
  public id!: number;

  public getProducts!: BelongsToManyGetAssociationsMixin<Product>;
  public addProduct!: BelongsToManyAddAssociationMixin<Product, number>;
  public removeProduct!: BelongsToManyRemoveAssociationMixin<Product, number>;

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
    sequelize,
    tableName: "carts",
  }
);

export default Cart;
