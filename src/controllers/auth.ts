import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";

export const getLogin = (_req: Request, res: Response, _next: NextFunction) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

export const postLogin = (req: Request, res: Response, _next: NextFunction) => {
  User.findById("695f6b6871f02ca372daac24")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

export function postLogout(req: Request, res: Response, _next: NextFunction) {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
}
