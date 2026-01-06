import { mkdir, readFile, writeFile } from "fs";
import { join } from "path";
import { Cart } from "./cart";

// Define the interface for a product
interface ProductData {
  title: string;
  imageUrl: string;
  description: string;
  price: string;
  id: string | null;
}

// Construct the path to the JSON file
const dataDir = join(process.cwd(), "data");
const p: string = join(dataDir, "products.json");

// Utility function to get products from file
const getProductsFromFile = (cb: (products: ProductData[]) => void): void => {
  readFile(p, (err, fileContent) => {
    if (err || !fileContent.length) {
      cb([]);
    } else {
      try {
        const data: ProductData[] = JSON.parse(fileContent.toString());
        cb(data);
      } catch (e) {
        cb([]);
      }
    }
  });
};

// Product class
export class Product {
  id: string | null;
  title: string;
  imageUrl: string;
  description: string;
  price: string;
  constructor(
    id: string | null,
    title: string,
    imageUrl: string,
    description: string,
    price: string
  ) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save(): void {
    getProductsFromFile((products: ProductData[]) => {
      if (this.id) {
        // Update existing product
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;

        // Ensure directory exists before writing
        mkdir(dataDir, { recursive: true }, (dirErr) => {
          if (dirErr) {
            console.error("Error creating data directory:", dirErr);
            return;
          }
          writeFile(p, JSON.stringify(updatedProducts, null, 2), (err) => {
            if (err) console.error("Error updating product:", err);
          });
        });
      } else {
        // Create new product
        this.id = Math.random().toString();
        products.push(this);

        mkdir(dataDir, { recursive: true }, (dirErr) => {
          if (dirErr) {
            console.error("Error creating data directory:", dirErr);
            return;
          }
          writeFile(p, JSON.stringify(products, null, 2), (err) => {
            if (err) console.error("Error saving new product:", err);
          });
        });
      }
    });
  }

  static deleteById(id: string) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id);
      if (product) {
        const updatedProducts = products.filter((prod) => prod.id !== id);
        mkdir(dataDir, { recursive: true }, (dirErr) => {
          if (dirErr) {
            console.error("Error creating data directory:", dirErr);
            return;
          }
          writeFile(p, JSON.stringify(updatedProducts), (err) => {
            if (!err) {
              Cart.deleteProduct(id, product.price);
            }
          });
        });
      }
    });
  }

  static fetchAll(cb: (products: ProductData[]) => void): void {
    getProductsFromFile(cb);
  }

  static findById(id: string, cb: (_?: ProductData) => void): void {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      cb(product);
    });
  }
}
