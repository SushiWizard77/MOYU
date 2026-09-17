import api from "./api";

export const codingService = {
  list: () => api.get("/coding").then((res) => res.data),
  get: (id, opts = {}) => api.get(`/coding/${id}`, { params: opts }).then((res) => res.data),
  run: (problemId, language, code, levelIndex) =>
    api.post("/coding/run", { problemId, language, code, levelIndex }).then((res) => res.data),
};