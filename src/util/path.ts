import { join } from "path";

const isProd = process.env.NODE_ENV === "production";

export const viewsPath = isProd
  ? join(__dirname, "../views") // views will be in dist
  : join(process.cwd(), "src", "views"); // views in src during dev
