import { WithId } from "mongodb";
import { UserDocument } from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: WithId<UserDocument> | null;
    }
  }
}

export {};
