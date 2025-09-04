// client/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { resetPassword } from "../api/auth";
import { useNavigate, useLocation } from "react-router-dom";
import avatarImage from "/Avatar-Image.png";
import bgImage from "/Login-SignUp-Background-Image.png";
import "../styles/authPages.css"; // ✅ shared CSS

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMsg("Passwords do not match");
    }
    setProcessing(true);
    try {
      const res = await resetPassword({ email, code, newPassword });
      setMsg(res.message);
      setTimeout(() => {
        navigate("/membership", {
          state: {
            successMsg: "Password updated successfully. Please log in.",
          },
        });
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Reset failed");
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
            <h2 className="title">Reset Password</h2>

            {msg && <div className="banner">{msg}</div>}

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
                  placeholder="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="label">New Password</label>
                <input
                  type="password"
                  className="input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Confirm Password</label>
                <input
                  type="password"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button className="cta" type="submit" disabled={processing}>
                {processing ? "Processing..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
