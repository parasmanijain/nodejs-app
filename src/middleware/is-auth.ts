import { NextFunction, Request, Response } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};
