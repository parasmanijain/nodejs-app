import { NextFunction, Request, Response } from "express";

export const getLogin = (req: Request, res: Response, _next: NextFunction) => {
  const cookieHeader = req.get("Cookie");
  let isLoggedIn = false;
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const loggedInCookie = cookies.find((c) => c.startsWith("loggedIn="));
    if (loggedInCookie) {
      isLoggedIn = loggedInCookie.split("=")[1] === "true";
    }
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn,
  });
};

export const postLogin = (req: Request, res: Response, _next: NextFunction) => {
  res.setHeader("Set-Cookie", "loggedIn=true");
  res.redirect("/");
};
