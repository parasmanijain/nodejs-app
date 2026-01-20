import { NextFunction, Request, Response } from "express";

export const get404 = (req: Request, res: Response) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isAuthenticated: req.session.isLoggedIn,
  });
};

export const get500 = (req: Request, res: Response, _next: NextFunction) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
};
