import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Landing, Membership, ProtectedRoute } from "./components";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Membership page: accessible without login */}
      <Route path="/membership" element={<Membership />} />

      {/* Profile page: protected */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      {/* Redirect unknown paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
