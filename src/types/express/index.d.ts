import User from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: InstanceType<typeof User>; // type-safe Sequelize instance
    }
  }
}
