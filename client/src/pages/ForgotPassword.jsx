import React, { useState } from "react";
import { forgotPassword } from "../api/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPassword({ email });
      setMsg(res.message);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error sending reset code");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Code</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
