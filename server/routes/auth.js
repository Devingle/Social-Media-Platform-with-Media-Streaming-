import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const createToken = (user) =>
  jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  const exists = await User.findOne({ $or: [{ email }, { name }] });
  if (exists)
    return res.status(400).json({ message: "Email or username already used" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: passwordHash });

  const token = createToken(user);
  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({ id: user._id, name: user.name, email: user.email });
});

// Login
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password)
    return res.status(400).json({ message: "All fields are required" });

  const user = await User.findOne({
    $or: [{ email: identifier }, { name: identifier }],
  });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = createToken(user);
  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ id: user._id, name: user.name, email: user.email });
});

// Get profile
router.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ id: decoded.id, name: decoded.name, email: decoded.email });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out" });
});

export default router;
