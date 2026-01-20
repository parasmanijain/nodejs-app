import { NextFunction, Request, Response } from "express";
import { compare, hash } from "bcryptjs";
import { createTransport } from "nodemailer";
import dotenv from "dotenv";
import { randomBytes } from "crypto";
import { validationResult } from "express-validator";
const sendgridTransport = require("nodemailer-sendgrid-transport");
import { User } from "../models/user";

dotenv.config();

const { SENDEMAIL_API_KEY, SENDEMAIL_EMAIL_ADDRESS } = process.env;

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
    const { email, password } = req.body as {
      email: string;
      password: string;
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        errorMessage: errors.array()[0].msg,
      });
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

export const postReset = (req: Request, res: Response, _next: NextFunction) => {
  randomBytes(32, async (err, buffer) => {
    if (err) {
      console.error(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        req.flash("error", "No account with that email found.");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
      await user.save();
      res.redirect("/");
      await transporter.sendMail({
        to: req.body.email,
        from: SENDEMAIL_EMAIL_ADDRESS,
        subject: "Password reset",
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `,
      });
    } catch (error) {
      console.error(error);
      res.redirect("/reset");
    }
  });
};

export const getNewPassword = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const token = req.params.token as string;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      req.flash("error", "Invalid or expired token.");
      return res.redirect("/reset");
    }
    const messages = req.flash("error");
    const message = messages.length > 0 ? messages[0] : null;
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: message,
      userId: user._id.toString(),
    });
  } catch (err) {
    console.error(err);
    res.redirect("/reset");
  }
};

export const postNewPassword = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const { password, userId, passwordToken } = req.body as {
      password: string;
      userId: string;
      passwordToken: string;
    };
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    if (!user) {
      req.flash("error", "Invalid or expired reset token.");
      return res.redirect("/reset");
    }
    const hashedPassword = await hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.redirect("/reset");
  }
};
