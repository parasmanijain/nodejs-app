import { NextFunction, Request, Response } from "express";

export const getLogin = (req: Request, res: Response, _next: NextFunction) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
  });
};
