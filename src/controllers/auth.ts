import { NextFunction, Request, Response } from "express";
import { compare, hash } from "bcryptjs";
import { User } from "../models/user";

export const getLogin = (req: Request, res: Response, _next: NextFunction) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: req.flash("error"),
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
  });
};

export const postLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/login");
    }
    const doMatch = await compare(password, user.password);
    if (!doMatch) {
      return res.redirect("/login");
    }
    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();
    req.session.save((err) => {
      if (err) console.error(err);
      res.redirect("/");
    });
  } catch (err) {
    console.error(err);
    res.redirect("/login");
  }
};

export const postSignup = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { email, password, confirmPassword } = req.body as {
      email: string;
      password: string;
      confirmPassword: string;
    };

    if (password !== confirmPassword) {
      return res.redirect("/signup");
    }
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
    console.error(err);
    res.redirect("/signup");
  }
};

export const postLogout = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/");
  });
};
