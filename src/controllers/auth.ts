import { NextFunction, Request, Response } from "express";
import { User } from "../models/user";

export const getLogin = (_req: Request, res: Response, _next: NextFunction) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

export const postLogin = async (req: Request, res: Response) => {
  try {
    const user = await User.findById("695f6b6871f02ca372daac24");
    if (!user) {
      return res.redirect("/login");
    }
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
};

export function postLogout(req: Request, res: Response, _next: NextFunction) {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
}
