import api from "./api";

export const projectService = {
  list: () => api.get("/projects").then((res) => res.data),
  create: (payload) => api.post("/projects", payload).then((res) => res.data),
  update: (id, payload) => api.patch(`/projects/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/projects/${id}`).then((res) => res.data),
};