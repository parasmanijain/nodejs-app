import {
  DataTypes,
  Model,
  Optional,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
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
  public addProducts!: BelongsToManyAddAssociationsMixin<Product, number>;
  public setProducts!: BelongsToManySetAssociationsMixin<Product, number>;
  public removeProduct!: BelongsToManyRemoveAssociationMixin<Product, number>;
  public removeProducts!: BelongsToManyRemoveAssociationsMixin<Product, number>;
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
    modelName: "cart",
    timestamps: false,
  }
);

export default Cart;
