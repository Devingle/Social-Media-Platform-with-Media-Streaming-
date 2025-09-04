//database schemas (Mongoose)
//Schema for user
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationCode: { type: String },
    // ✅ Forgot password fields
    resetCode: String,
    resetCodeExpires: Date,

    // ✅ New fields for resend limits
    lastResendAt: Date,
    resendCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
