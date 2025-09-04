import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../config/email.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const createToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.username, email: user.email },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

/**
 * SIGNUP with Email Verification + rate limiting
 */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let user = await User.findOne({ email });

    // ✅ If email already exists
    if (user) {
      if (user.verified) {
        // User is already verified → block duplicate signup
        return res
          .status(400)
          .json({ message: "Email already registered. Please log in." });
      }

      // User exists but not verified → apply rate limit
      const now = new Date();
      if (user.lastResendAt && now - user.lastResendAt < 60 * 1000) {
        return res
          .status(429)
          .json({ message: "Please wait before requesting another OTP." });
      }

      // Generate new OTP
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      user.verificationCode = verificationCode;
      user.lastResendAt = now;
      user.resendCount = (user.resendCount || 0) + 1;
      await user.save();

      await sendEmail(
        email,
        "Verify your StreamifyAi account",
        `<h2>Welcome back to StreamifyAi 🎶</h2>
         <p>Your new verification code is: <b>${verificationCode}</b></p>`
      );

      console.log(
        "🔁 Re-sent OTP for existing unverified user:",
        email,
        verificationCode
      );

      return res.status(200).json({
        message: "Account exists but not verified. New verification code sent.",
      });
    }

    // ✅ New user signup
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    user = await User.create({
      username,
      email,
      password: passwordHash,
      verified: false,
      verificationCode,
      lastResendAt: new Date(),
      resendCount: 1,
    });

    await sendEmail(
      email,
      "Verify your StreamifyAi account",
      `<h2>Welcome to StreamifyAi 🎶</h2>
       <p>Your verification code is: <b>${verificationCode}</b></p>`
    );

    console.log("✅ OTP code for", email, "is", verificationCode);

    return res.status(201).json({
      message:
        "Signup successful. Please check your email for verification code.",
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ message: "Error: " + err.message });
  }
});

// Resend verification code with rate limiting
router.post("/resend-code", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.verified)
    return res.status(400).json({ message: "User already verified" });

  const now = new Date();

  // ✅ 1-minute cooldown
  if (user.lastResendAt && now - user.lastResendAt < 60 * 1000) {
    return res
      .status(429)
      .json({ message: "Please wait before requesting again." });
  }

  // ✅ Daily limit (5 per day)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset to start of today
  if (!user.lastResendAt || user.lastResendAt < today) {
    user.resendCount = 0; // reset daily count
  }
  if (user.resendCount >= 5) {
    return res
      .status(429)
      .json({ message: "Daily resend limit reached. Try again tomorrow." });
  }
  // Generate a new code
  const newCode = crypto.randomInt(100000, 999999).toString();
  user.verificationCode = newCode;
  user.lastResendAt = now;
  user.resendCount += 1;
  await user.save();

  // Send new OTP email
  await sendEmail(
    email,
    "Resend Verification Code - StreamifyAi",
    `<p>Your new verification code is: <b>${newCode}</b></p>`
  );

  console.log("🔁 Resent OTP code for", email, "is", newCode);

  res.json({ message: "New verification code sent to your email" });
});

/**
 * VERIFY Email
 */
router.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.verificationCode !== code)
    return res.status(400).json({ message: "Invalid code" });

  user.verified = true;
  user.verificationCode = undefined;
  await user.save();

  // Create login token now
  const token = createToken(user);
  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ message: "Email verified successfully ✅", user });
});

/**
 * LOGIN (only if verified)
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "All fields are required" });

  const user = await User.findOne({
    $or: [{ email: username }, { username: username }],
  });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  // Block login if not verified
  if (!user.verified) {
    return res.status(403).json({ message: "Please verify your email first." });
  }

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
    .json({ id: user._id, username: user.username, email: user.email });
});

/**
 * FORGOT Password - Request password reset
 */
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // ✅ Rate limit: only 1 reset per minute
  const now = new Date();
  if (user.resetCodeExpires && now - user.resetCodeExpires < 60 * 1000) {
    return res
      .status(429)
      .json({ message: "Please wait before requesting again." });
  }
  // Generate reset code
  const resetCode = crypto.randomInt(100000, 999999).toString();
  user.resetCode = resetCode;
  user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min validity
  await user.save();

  await sendEmail(
    email,
    "StreamifyAi Password Reset",
    `<p>Your password reset code is: <b>${resetCode}</b></p>`
  );

  res.json({ message: "Password reset code sent to your email" });
});

/**
 * RESET Password
 */
router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (user.resetCode !== code) {
    return res.status(400).json({ message: "Invalid reset code" });
  }
  if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: "Reset code expired" });
  }
  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.password = passwordHash;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  await user.save();

  res.json({ message: "Password updated successfully ✅" });
});

/**
 * PROFILE
 */
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

/**
 * LOGOUT
 */
router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
  res.json({ message: "Logged out" });
});

export default router;
