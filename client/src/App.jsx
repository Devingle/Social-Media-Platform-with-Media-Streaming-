import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Landing, Membership } from "./components";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/membership" element={<Membership />} />
      {/* optional: redirect any unknown path to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
