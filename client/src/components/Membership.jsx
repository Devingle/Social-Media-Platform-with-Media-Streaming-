// src/membership/Membership.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup, login, getProfile } from "../api/auth";
import bgImage from "/Login-SignUp-Background-Image.png";
import avatarImage from "/Avatar-Image.png";

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

const InputField = React.memo(function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  autoComplete,
  showPassword,
  setShowPassword,
  hidden = false,
}) {
  return (
    <div className={`field ${hidden ? "hidden" : ""}`}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <div className="input-container">
        <input
          id={id}
          type={showPassword && type === "password" ? "text" : type}
          className={`input ${error ? "invalid" : ""}`}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        {type === "password" && (
          <button
            type="button"
            className="toggle-inside"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
});

export default function Membership() {
  const [mode, setMode] = useState("login"); // login | signup
  const [processing, setProcessing] = useState(false);
  const [authError, setAuthError] = useState("");
  // login
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  // signup
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getProfile();
        if (data.user) navigate("/profile", { replace: true });
      } catch {}
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = cssStyles;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const validate = useMemo(
    () => () => {
      const errs = {};
      if (mode === "signup") {
        if (!signupUsername.trim()) errs.username = "Username required";
        if (!signupEmail.trim()) errs.email = "Email required";
        else if (!validateEmail(signupEmail)) errs.email = "Invalid email";
        if (!signupPassword) errs.password = "Password required";
        if (!signupConfirm) errs.confirm = "Confirm password required";
        else if (signupConfirm !== signupPassword)
          errs.confirm = "Passwords do not match";
      } else {
        if (!loginUsername.trim()) errs.username = "Email or username required";
        if (!loginPassword) errs.password = "Password required";
      }
      return errs;
    },
    [
      mode,
      signupUsername,
      signupEmail,
      signupPassword,
      signupConfirm,
      loginUsername,
      loginPassword,
    ]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (processing) return;

    const errs = validate();
    setErrors(errs);
    setAuthError("");
    if (Object.keys(errs).length) return;

    setProcessing(true);
    try {
      if (mode === "signup") {
        await signup({
          name: signupUsername,
          email: signupEmail,
          password: signupPassword,
        });
      } else {
        await login({ identifier: loginUsername, password: loginPassword });
      }
      navigate("/profile", { replace: true });
    } catch (err) {
      setAuthError(err.response?.data?.message || "Authentication failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`page-root ${mode}`}>
      {/* Background with blur */}
      <div className="bg">
        <img src={bgImage} alt="" aria-hidden="true" />
        <div className="bg-blur" />
      </div>

      <div className="wrap">
        {/* Circle card with throbbing + glowing avatar, content stays perfectly inside */}
        <div className={`circle-card ${mode} throbbing`}>
          <div className="ring" />
          <div className="content">
            <img
              src={avatarImage}
              alt="Avatar"
              className="avatar throbbing-avatar"
            />
            <h2 className="title">Welcome to StreamifyAi</h2>

            {authError && <div className="banner">{authError}</div>}

            <div
              className="tabs"
              role="tablist"
              aria-label="Authentication Tabs"
            >
              <button
                type="button"
                className={`tab ${mode === "login" ? "active" : ""}`}
                onClick={() => setMode("login")}
                role="tab"
                aria-selected={mode === "login"}
                tabIndex={mode === "login" ? 0 : -1}
              >
                Login
              </button>
              <button
                type="button"
                className={`tab ${mode === "signup" ? "active" : ""}`}
                onClick={() => setMode("signup")}
                role="tab"
                aria-selected={mode === "signup"}
                tabIndex={mode === "signup" ? 0 : -1}
              >
                Sign Up
              </button>
            </div>

            <form className="form" onSubmit={handleSubmit} aria-live="polite">
              <InputField
                id="login-username"
                label="Username or Email"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                error={mode === "login" ? errors.username : ""}
                autoComplete="username"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                hidden={mode !== "login"}
              />
              <InputField
                id="login-password"
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                error={mode === "login" ? errors.password : ""}
                autoComplete="current-password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                hidden={mode !== "login"}
              />

              <InputField
                id="signup-username"
                label="Username"
                value={signupUsername}
                onChange={(e) => setSignupUsername(e.target.value)}
                error={mode === "signup" ? errors.username : ""}
                autoComplete="username"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                hidden={mode !== "signup"}
              />
              <InputField
                id="signup-email"
                label="Email"
                type="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                error={mode === "signup" ? errors.email : ""}
                autoComplete="email"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                hidden={mode !== "signup"}
              />
              <InputField
                id="signup-password"
                label="Password"
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                error={mode === "signup" ? errors.password : ""}
                autoComplete="new-password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                hidden={mode !== "signup"}
              />
              <InputField
                id="signup-confirm"
                label="Confirm Password"
                type="password"
                value={signupConfirm}
                onChange={(e) => setSignupConfirm(e.target.value)}
                error={mode === "signup" ? errors.confirm : ""}
                autoComplete="new-password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                hidden={mode !== "signup"}
              />

              <button
                className="cta"
                type="submit"
                disabled={processing}
                aria-busy={processing}
              >
                {processing
                  ? "Processing..."
                  : mode === "login"
                  ? "LOGIN"
                  : "CREATE ACCOUNT"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const cssStyles = `
.page-root { min-height:100vh; display:grid; place-items:center; overflow:hidden; background:#05070c; }
.bg { position:fixed; inset:0; }
.bg img { width:100%; height:100%; object-fit:cover; display:block; filter:brightness(0.6); }
.bg-blur { position:absolute; inset:0; backdrop-filter: blur(8px); background: rgba(0,0,0,0.2); }

.wrap { position:relative; z-index:2; width:100%; display:flex; justify-content:center; padding:28px; }

/* Circle card with throbbing + smooth size transition */
.circle-card {
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  width: 740px;
  height: 740px;
  transition: width 0.35s ease, height 0.35s ease, box-shadow 0.35s ease, filter 0.35s ease;
  overflow: hidden;
  animation: cardThrob 2.5s infinite ease-in-out;
}
.circle-card.signup {
  width: 900px;
  height: 900px;
}
@media (max-width: 820px) {
  .circle-card {
    width: 84vw;
    height: 84vw;
  }
  .circle-card.signup {
    width: 88vw;
    height: 88vw;
  }
}

/* Neon glowing ring */
.circle-card .ring {
  position:absolute;
  inset:0;
  border-radius:50%;
  background: radial-gradient(80% 80% at 50% 20%, rgba(27,36,58,0.9) 0%, rgba(10,12,18,0.92) 60%, rgba(6,8,12,0.98) 100%);
  border: 2px solid rgba(126,203,255,0.55);
  box-shadow:
    0 0 26px rgba(0,183,255,0.45),
    inset 0 0 12px rgba(0,183,255,0.3),
    0 0 50px rgba(183,0,255,0.3),
    inset 0 0 20px rgba(183,0,255,0.18);
  animation: ringThrob 2.5s infinite ease-in-out;
}

/* Avatar throbbing and glowing */
.avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 32px rgba(43,124,255,0.9);
  animation: throbbingAvatar 2.5s infinite ease-in-out;
  position: relative;
  z-index: 5;
}

@keyframes throbbingAvatar {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 32px rgba(43,124,255,0.9);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 68px rgba(126,203,255,1);
  }
}

/* Smooth card throbbing */
@keyframes cardThrob {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(43, 124, 255, 0.5),
      0 0 40px rgba(126, 203, 255, 0.6),
      0 0 80px rgba(183, 0, 255, 0.7);
  }
  50% {
    box-shadow:
      0 0 40px rgba(43, 124, 255, 0.9),
      0 0 80px rgba(126, 203, 255, 1),
      0 0 120px rgba(183, 0, 255, 1);
  }
}

@keyframes ringThrob {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* Content inside circle */
.content {
  position: relative;
  z-index: 2;
  width: 72%;
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 8px 4px 6px;
  overflow: visible;
}

.title {
  margin: 4px 0 10px;
  font-size: 26px;
  font-weight: 800;
  color: #d8e8ff;
  text-shadow: 0 0 14px rgba(126,203,255,0.7);
  user-select: none;
}

/* Tabs style */
.tabs {
  display: flex;
  gap: 10px;
  width: 100%;
}
.tab {
  flex: 1;
  padding: 10px 14px;
  border-radius: 16px;
  border: 1px solid rgba(126, 203, 255, 0.25);
  color: #b9c9ff;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  user-select: none;
}
.tab.active {
  color: #fff;
  box-shadow: 0 0 18px rgba(126, 203, 255, 0.5) inset;
}

/* Errors */
.banner {
  width: 100%;
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.35);
  color: #ffbaba;
  padding: 8px 12px;
  border-radius: 10px;
  user-select: none;
}

/* Form */
.form {
  width: 100%;
  display: grid;
  gap: 12px;
}
.field {
  display: grid;
  gap: 6px;
}
.field.hidden {
  display: none;
}
.label {
  color: #aab6ff;
  font-size: 14px;
  user-select: none;
}
.input-container {
  position: relative;
}
.input {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  padding: 10px 52px 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(126, 203, 255, 0.28);
  color: #e8eeff;
  caret-color: #68cfff;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.input:focus {
  outline: none;
  border-color: #2b7cff;
  box-shadow: 0 0 16px rgba(43, 124, 255, 0.6);
  background: rgba(255, 255, 255, 0.07);
}
.input.invalid {
  border-color: #ff6b6b;
}
.toggle-inside {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  color: #7ecbff;
  border: none;
  cursor: pointer;
  user-select: none;
}

/* CTA */
.cta {
  width: 100%;
  height: 50px;
  margin-top: 12px;
  border-radius: 16px;
  border: 1px solid rgba(126, 203, 255, 0.45);
  background: linear-gradient(
    135deg,
    rgba(0, 183, 255, 0.15),
    rgba(183, 0, 255, 0.15)
  );
  color: #bfe4ff;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 26px rgba(89, 174, 255, 0.35);
}
.page-root.signup .cta {
  background: linear-gradient(
    135deg,
    rgba(145, 255, 155, 0.18),
    rgba(120, 180, 255, 0.18)
  );
}
.cta:hover {
  box-shadow: 0 0 36px rgba(89, 174, 255, 0.55);
}

/* Prevent accidental selection on non-inputs */
.content,
.tabs,
.title,
.tab,
.banner,
.cta,
.label {
  user-select: none;
}
input,
button {
  user-select: text;
}

/* Responsive */
@media (max-width: 820px) {
  .circle-card {
    width: 84vw;
    height: 84vw;
  }
  .circle-card.signup {
    width: 88vw;
    height: 88vw;
  }
}
`;
