import "express-session";

declare module "express-session" {
  interface SessionData {
    isLoggedIn?: boolean;
    user?: import("../../models/user").UserDocument;
  }
}
