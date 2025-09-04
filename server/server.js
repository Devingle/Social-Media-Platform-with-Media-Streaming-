import dotenv from "dotenv";
dotenv.config();
/*Starts the server.

Loads middleware (CORS, cookieParser, express.json).

Connects MongoDB (from config/db.js).

Uses routes from routes.*/

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => res.send("Backend running 🚀"));
app.use("/auth", authRoutes);

// Start server
app.listen(5000, () => console.log("Server running at http://localhost:5000"));
