import { NextFunction, Request, Response } from "express";
import { compare, hash } from "bcryptjs";
import { createTransport } from "nodemailer";
import dotenv from "dotenv";
const sendgridTransport = require("nodemailer-sendgrid-transport");
import { User } from "../models/user";

dotenv.config();

const { SENDEMAIL_API_KEY } = process.env;

const transporter = createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDEMAIL_API_KEY,
    },
  }),
);

export const getLogin = (req: Request, res: Response, _next: NextFunction) => {
  const messages = req.flash("error");
  const message = messages.length > 0 ? messages[0] : null;
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

export const getSignup = (req: Request, res: Response, _next: NextFunction) => {
  const messages = req.flash("error");
  const message = messages.length > 0 ? messages[0] : null;
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
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
      req.flash("error", "Invalid email or password.");
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
      req.flash("error", "Passwords don't match.");
      return res.redirect("/signup");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "E-Mail exists already, please pick a different one.");
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
    return transporter.sendMail({
      to: email,
      from: "parasmani.jain2208@gmail.com",
      subject: "Signup succeeded!",
      html: "<h1>You successfully signed up!</h1>",
    });
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

export const getReset = (req: Request, res: Response, _next: NextFunction) => {
  const messages = req.flash("error");
  const message = messages.length > 0 ? messages[0] : null;

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};
