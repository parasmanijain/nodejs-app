import { NextFunction, Request, Response } from "express";
import { hash } from "bcryptjs";
import { User } from "../models/user";

export const getLogin = (_req: Request, res: Response, _next: NextFunction) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

export const getSignup = (
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
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
    req.session.save((err) => {
      console.log(err);
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    res.redirect("/login");
  }
};

export const postSignup = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect("/signup");
    }
    const hashedPassword = await hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      cart: { items: [] },
    });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.redirect("/signup");
  }
};

export function postLogout(req: Request, res: Response, _next: NextFunction) {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
}
