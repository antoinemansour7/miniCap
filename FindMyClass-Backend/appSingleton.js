import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

class AppSingleton {
  constructor() {
    if (!AppSingleton.instance) {
      this.app = express();

      // Middleware setup
      this.app.use(cors({
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type"]
      }));

      this.app.use(express.json());

      // Route setup
      this.app.use("/auth", authRoutes);

      AppSingleton.instance = this;
    }

    return AppSingleton.instance;
  }

  getApp() {
    return this.app;
  }
}

const instance = new AppSingleton();
Object.freeze(instance); // Ensure immutability

export default instance;