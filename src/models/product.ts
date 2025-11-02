import {
  DataTypes,
  Model,
  Optional,
  BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
} from "sequelize";
import { sequelize } from "../util/database";
import Cart from "./cart";
import CartItem from "./cart-item";

interface ProductAttributes {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, "id"> {}

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public title!: string;
  public price!: number;
  public imageUrl!: string;
  public description!: string;

  // Association mixins
  public getCarts!: BelongsToManyGetAssociationsMixin<Cart>;
  public addCart!: BelongsToManyAddAssociationMixin<Cart, number>;

  // This is the crucial part: tell TS that cartItem exists
  public cartItem?: CartItem; // optional, since not always loaded

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "products",
  }
);

export default Product;
