import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function testEmail() {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    let info = await transporter.sendMail({
      from: `"StreamifyAi" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to yourself
      subject: "Test Email from StreamifyAi",
      text: "If you see this, Gmail SMTP is working ✅",
    });

    console.log("✅ Test email sent:", info.response);
  } catch (err) {
    console.error("❌ Test email failed:", err.message);
  }
}

testEmail();
