import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  try {
    // ✅ Safety check
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing EMAIL_USER or EMAIL_PASS in .env");
    }

    // ✅ Create transporter inside function (fresh each time)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Debug logs
    console.log("📨 Sending email...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
    console.log("To:", to);
    console.log("Subject:", subject);

    await transporter.sendMail({
      from: `"StreamifyAi" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully to", to);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
  }
};
