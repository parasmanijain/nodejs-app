import { NextFunction, Request, Response } from "express";

export const getLogin = (req: Request, res: Response, _next: NextFunction) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

export const postLogin = (req: Request, res: Response, _next: NextFunction) => {
  req.session.isLoggedIn = true;
  res.redirect("/");
};
