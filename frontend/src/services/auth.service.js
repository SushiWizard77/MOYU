import api from "./api";

export const authService = {
  login: (email, password) => api.post("/auth/login", { email, password }).then((res) => res.data),
  register: (name, email, password) => api.post("/auth/register", { name, email, password }).then((res) => res.data),
  getMe: () => api.get("/auth/me").then((res) => res.data),
  updateMe: (updates) => api.patch("/auth/me", updates).then((res) => res.data),
  forgotPassword: (email) => api.post("/auth/password/forgot", { email }).then((res) => res.data),
  resetPassword: (token, newPassword) => api.post("/auth/password/reset", { token, newPassword }).then((res) => res.data),
  googleLogin: (credential) => api.post("/auth/google", { credential }).then((res) => res.data),
  changePassword: (currentPassword, newPassword) =>
    api.patch("/auth/password", { currentPassword, newPassword }).then((res) => res.data),
  deleteAccount: () => api.delete("/auth/me").then((res) => res.data),
};
