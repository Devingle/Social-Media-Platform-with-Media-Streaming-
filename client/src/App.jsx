import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Landing, Membership, ProtectedRoute } from "./components";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Membership page: accessible without login */}
      <Route path="/membership" element={<Membership />} />

      <Route
        path="/verify-email"
        element={
          <ErrorBoundary>
            <VerifyEmail />
          </ErrorBoundary>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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
