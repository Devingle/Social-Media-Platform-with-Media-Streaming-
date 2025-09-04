// client/src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../api/auth";
import avatarImage from "/Avatar-Image.png";
import bgImage from "/Login-SignUp-Background-Image.png";
import "../styles/authPages.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch {
        navigate("/membership");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/membership");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "#d8e8ff",
          fontSize: "18px",
        }}
      >
        Loading profile...
      </div>
    );
  }

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
            <h2 className="title">
              Welcome, {user?.name || user?.username || "Guest"}!
            </h2>

            <div
              style={{
                fontSize: "15px",
                color: "#cfe0ff",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              <p>Email: {user?.email}</p>
              <p>User ID: {user?.id || user?._id}</p>
            </div>

            <button
              className="cta"
              style={{
                background: "linear-gradient(180deg,#ff3366,#cc0044)",
                color: "#fff",
                fontWeight: "800",
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
