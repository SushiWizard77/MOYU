import api from "./api";

export const practiceService = {
  list: (params) => api.get("/practice", { params }).then((res) => res.data),
  attempt: (id, selectedOptionIndex) => api.post(`/practice/${id}/attempt`, { selectedOptionIndex }).then((res) => res.data),
  stats: () => api.get("/practice/stats").then((res) => res.data),
  startSession: (params) => api.get("/practice/session/start", { params }).then((res) => res.data),
  submitSession: (answers) => api.post("/practice/session/submit", { answers }).then((res) => res.data),
};
