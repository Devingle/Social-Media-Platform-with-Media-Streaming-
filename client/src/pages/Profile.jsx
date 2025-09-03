import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logout } from "../api/auth";

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

  if (loading) return <div style={{ padding: 40 }}>Loading profile...</div>;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 40,
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {user && (
        <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontSize: 28, color: "#7ecbff" }}>
            Welcome, {user.name}!
          </h1>
          <p style={{ fontSize: 16, color: "#ddeeff" }}>Email: {user.email}</p>
          <p style={{ fontSize: 16, color: "#ddeeff" }}>User ID: {user.id}</p>
          <button
            onClick={handleLogout}
            style={{
              marginTop: 30,
              padding: "12px 24px",
              fontSize: 16,
              fontWeight: "bold",
              color: "#fff",
              background: "#ff3366",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
