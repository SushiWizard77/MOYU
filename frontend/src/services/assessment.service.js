import api from "./api";

export const assessmentService = {
  list: () => api.get("/assessments").then((res) => res.data),
  get: (id) => api.get(`/assessments/${id}`).then((res) => res.data),
  submit: (id, answers) => api.post(`/assessments/${id}/submit`, { answers }).then((res) => res.data),
  results: () => api.get("/assessments/results").then((res) => res.data),
  readiness: () => api.get("/assessments/readiness").then((res) => res.data),
};
