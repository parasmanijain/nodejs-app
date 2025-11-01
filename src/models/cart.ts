import fs from "fs";
import path from "path";

// Define interfaces for cart data
interface CartProduct {
  id: string;
  qty: number;
}

interface CartData {
  products: CartProduct[];
  totalPrice: number;
}

const dataDir = path.join(process.cwd(), "data");
const p: string = path.join(dataDir, "cart.json");

export class Cart {
  static addProduct(id: string, productPrice: string): void {
    fs.readFile(p, (err, fileContent) => {
      let cart: CartData = { products: [], totalPrice: 0 };

      if (!err && fileContent.length) {
        try {
          cart = JSON.parse(fileContent.toString()) as CartData;
        } catch (e) {
          console.error("Error parsing cart file:", e);
        }
      }

      // Find existing product
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct: CartProduct;

      // Add new product or increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct, qty: existingProduct.qty + 1 };
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +productPrice;

      // Ensure data directory exists before writing
      fs.mkdir(dataDir, { recursive: true }, (dirErr) => {
        if (dirErr) {
          console.error("Error creating data directory:", dirErr);
          return;
        }

        fs.writeFile(p, JSON.stringify(cart, null, 2), (writeErr) => {
          if (writeErr) {
            console.error("Error saving cart:", writeErr);
          }
        });
      });
    });
  }

  static deleteProduct(id: string, productPrice: string): void {
    fs.readFile(p, (err, fileContent) => {
      if (err || !fileContent.length) {
        return;
      }

      let updatedCart: CartData;
      try {
        updatedCart = JSON.parse(fileContent.toString()) as CartData;
      } catch (e) {
        console.error("Error parsing cart file:", e);
        return;
      }
      const product = updatedCart.products.find((prod) => prod.id === id);
      if (!product) {
        // Product not in cart — nothing to delete
        return;
      }
      const productQty = product.qty;
      updatedCart.products = updatedCart.products.filter(
        (prod) => prod.id !== id
      );
      updatedCart.totalPrice =
        updatedCart.totalPrice - +productPrice * productQty;

      // Ensure total price doesn't go negative
      if (updatedCart.totalPrice < 0) {
        updatedCart.totalPrice = 0;
      }

      // Ensure data directory exists before writing
      fs.mkdir(dataDir, { recursive: true }, (dirErr) => {
        if (dirErr) {
          console.error("Error creating data directory:", dirErr);
          return;
        }

        fs.writeFile(p, JSON.stringify(updatedCart, null, 2), (writeErr) => {
          if (writeErr) {
            console.error("Error deleting product from cart:", writeErr);
          }
        });
      });
    });
  }

  static getCart(cb: (cart: CartData) => void): void {
    fs.readFile(p, (err, fileContent) => {
      if (err || !fileContent.length) {
        cb({ products: [], totalPrice: 0 });
        return;
      }

      try {
        const cart = JSON.parse(fileContent.toString()) as CartData;
        cb(cart);
      } catch (e) {
        console.error("Error parsing cart data:", e);
        cb({ products: [], totalPrice: 0 });
      }
    });
  }
}
