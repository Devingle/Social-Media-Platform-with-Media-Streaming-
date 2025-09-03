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
export const logout = () => api.post("/auth/logout").then((res) => res.data);
