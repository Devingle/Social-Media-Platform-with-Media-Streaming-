import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmail, resendCode } from "../api/auth";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if passed via navigation state
  React.useEffect(() => {
    if (location?.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  // Countdown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyEmail({ email, code });
      setMsg(res.message);
      setTimeout(() => {
        navigate("/membership", {
          state: {
            successMsg:
              "Signup successful. Please verify your email to continue.",
          },
        });
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendCode({ email });
      setResendMsg(res.message);
      setCooldown(30); // ✅ set cooldown (30 sec)
    } catch (err) {
      setResendMsg(err.response?.data?.message || "Could not resend code");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Verify Your Email</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Verify</button>
      </form>
      {msg && <p>{msg}</p>}

      <hr style={{ margin: "20px 0" }} />

      <button onClick={handleResend} disabled={cooldown > 0}>
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
      </button>
      {resendMsg && <p>{resendMsg}</p>}
    </div>
  );
}
