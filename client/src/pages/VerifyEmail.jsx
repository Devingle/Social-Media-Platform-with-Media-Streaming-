import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyEmail, resendCode } from "../api/auth";
import avatarImage from "/Avatar-Image.png";
import bgImage from "/Login-SignUp-Background-Image.png";
import "../styles/authPages.css";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [processing, setProcessing] = useState(false);

  const codeInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if passed via navigation state
  useEffect(() => {
    if (location?.state?.email) setEmail(location.state.email);
    // Auto-focus code input when email is pre-filled
    setTimeout(() => codeInputRef.current?.focus(), 100);
  }, [location]);

  // Countdown timer effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  useEffect(() => {
    if (resendMsg) {
      const timer = setTimeout(() => setResendMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [resendMsg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMsg("");
    try {
      const res = await verifyEmail({ email, code });
      setMsg(res.message);
      setTimeout(() => {
        navigate("/membership", {
          state: { successMsg: "Email verified successfully. Please log in." },
        });
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Verification failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendCode({ email });
      const { cooldown: serverCooldown = 60, remainingDaily } = res.data;
      setResendMsg(`${res.data.message} (${remainingDaily} attempts left)`);
      setCooldown(serverCooldown);
    } catch (err) {
      const {
        cooldown: serverCooldown,
        remainingDaily,
        message,
      } = err.response?.data || {};
      setResendMsg(message || "Could not resend code");
      setCooldown(serverCooldown || 60);
    }
  };

  return (
    <div className="page-root">
      <div className="bg">
        <img src={bgImage} alt="" />
        <div className="bg-blur" />
      </div>

      <div className="wrap">
        <div className="circle-card throbbing">
          <div className="ring" />
          <div className="content">
            <img src={avatarImage} alt="Avatar" className="avatar" />
            <h2 className="title">Verify Your Email</h2>

            {msg && <div className="banner">{msg}</div>}
            {resendMsg && (
              <div
                className="banner"
                style={{
                  background: "rgba(107,255,107,0.12)",
                  border: "1px solid rgba(107,255,107,0.35)",
                  color: "#baffba",
                }}
              >
                {resendMsg}
              </div>
            )}

            <form className="form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Verification Code</label>
                <input
                  type="text"
                  className="input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  ref={codeInputRef}
                />
              </div>
              <button className="cta" type="submit" disabled={processing}>
                {processing ? "Processing..." : "Verify Email"}
              </button>
            </form>

            <button
              className="cta"
              style={{
                marginTop: "12px",
                background: cooldown > 0 ? "#333a52" : "",
                cursor: cooldown > 0 ? "not-allowed" : "pointer",
              }}
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
