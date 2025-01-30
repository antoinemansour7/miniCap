import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();

// ✅ Allow requests from the React Native frontend
app.use(cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`🔥 Backend running on http://localhost:${PORT}`);
});