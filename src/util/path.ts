import { join } from "path";

const isProd = process.env.NODE_ENV === "production";

export const viewsPath = isProd
  ? join(__dirname, "../views") // views will be in dist
  : join(process.cwd(), "src", "views"); // views in src during dev

// Use absolute path based on environment
export const dataDir = isProd
  ? join(__dirname, "data") // dist/data in production
  : join(process.cwd(), "src", "data"); // src/data in development

export const imagesDir = isProd
  ? join(__dirname, "images") // dist/images in production
  : join(process.cwd(), "src", "images"); // src/images in development

export const invoicesDir = join(dataDir, "invoices");

export const logsDir =
  process.env.NODE_ENV === "production"
    ? join(__dirname) // dist/logs in prod
    : join(process.cwd(), "src"); // src/logs in dev

export const accessLogPath = join(logsDir, "access.log");
