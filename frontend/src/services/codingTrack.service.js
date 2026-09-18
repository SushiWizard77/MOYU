import api from "./api";

export const codingTrackService = {
  getLink: () => api.get("/coding-track/link").then((res) => res.data),
  updateLink: (payload) => api.patch("/coding-track/link", payload).then((res) => res.data),
  getStats: () => api.get("/coding-track/stats").then((res) => res.data),
  getStreak: () => api.get("/coding-track/streak").then((res) => res.data),
  getDaily: () => api.get("/coding-track/daily").then((res) => res.data),
  complete: (payload) => api.post("/coding-track/complete", payload).then((res) => res.data),
  verify: () => api.post("/coding-track/verify").then((res) => res.data),
  githubAuthUrl: () => api.get("/coding-track/github/auth-url").then((res) => res.data),
  githubCallback: (code) => api.post("/coding-track/github/callback", { code }).then((res) => res.data),
  githubStatus: () => api.get("/coding-track/github").then((res) => res.data),
  githubSelectRepo: (repoFullName) =>
    api.patch("/coding-track/github/repo", { repoFullName }).then((res) => res.data),
  githubSync: (payload) => api.post("/coding-track/github/sync", payload).then((res) => res.data),
};
