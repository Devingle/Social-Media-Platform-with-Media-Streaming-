// client/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { forgotPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";
import avatarImage from "/Avatar-Image.png";
import bgImage from "/Login-SignUp-Background-Image.png";
import "../styles/authPages.css"; // ✅ use shared CSS

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const res = await forgotPassword({ email });
      setMsg(res.message);
      // ✅ Redirect user to ResetPassword page with email pre-filled
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || "Error sending reset code");
    } finally {
      setProcessing(false);
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
            <h2 className="title">Forgot Password?</h2>

            {msg && <div className="banner">{msg}</div>}

            <form className="form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Enter your email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button className="cta" type="submit" disabled={processing}>
                {processing ? "Processing..." : "Send Reset Code"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
