// api/auth.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true, // crucial for cookie auth
});

export const signup = (data) =>
  api.post("/auth/signup", data).then((res) => res.data);
export const login = (data) =>
  api.post("/auth/login", data).then((res) => res.data);
export const getProfile = () =>
  api.get("/auth/profile").then((res) => res.data);
export const verifyEmail = (data) =>
  api.post("/auth/verify", data).then((res) => res.data);
export const forgotPassword = (data) =>
  api.post("/auth/forgot-password", data).then((res) => res.data);
export const resetPassword = (data) =>
  api.post("/auth/reset-password", data).then((res) => res.data);
export const resendCode = (data) =>
  api.post("/auth/resend-code", data).then((res) => res.data);
export const logout = () => api.post("/auth/logout").then((res) => res.data);
