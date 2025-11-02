import {
  DataTypes,
  Model,
  Optional,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
} from "sequelize";
import { sequelize } from "../util/database";
import Product from "./product"; // Import Product model

interface OrderAttributes {
  id: number;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, "id"> {}

class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;

  public getProducts!: BelongsToManyGetAssociationsMixin<Product>;
  public addProduct!: BelongsToManyAddAssociationMixin<Product, number>;
  public addProducts!: BelongsToManyAddAssociationsMixin<Product, number>;
  public setProducts!: BelongsToManySetAssociationsMixin<Product, number>;
  public removeProduct!: BelongsToManyRemoveAssociationMixin<Product, number>;

  // optional timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
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
    tableName: "orders",
  }
);

export default Order;
