import api from "./api";

export const adminService = {
  getOverview: () => api.get("/admin/overview").then((res) => res.data),
  listStudents: (params) => api.get("/admin/students", { params }).then((res) => res.data),
  getStudentDetail: (id) => api.get(`/admin/students/${id}`).then((res) => res.data),

  createCompany: (payload) => api.post("/admin/companies", payload).then((res) => res.data),
  updateCompany: (id, payload) => api.patch(`/admin/companies/${id}`, payload).then((res) => res.data),
  deleteCompany: (id) => api.delete(`/admin/companies/${id}`).then((res) => res.data),

  createResource: (payload) => api.post("/admin/resources", payload).then((res) => res.data),
  updateResource: (id, payload) => api.patch(`/admin/resources/${id}`, payload).then((res) => res.data),
  deleteResource: (id) => api.delete(`/admin/resources/${id}`).then((res) => res.data),

  createPracticeQuestion: (payload) => api.post("/admin/practice-questions", payload).then((res) => res.data),
  updatePracticeQuestion: (id, payload) => api.patch(`/admin/practice-questions/${id}`, payload).then((res) => res.data),
  deletePracticeQuestion: (id) => api.delete(`/admin/practice-questions/${id}`).then((res) => res.data),

  listCodingChallenges: () => api.get("/admin/coding-challenges").then((res) => res.data),
  createCodingChallenge: (payload) => api.post("/admin/coding-challenges", payload).then((res) => res.data),
  updateCodingChallenge: (id, payload) => api.patch(`/admin/coding-challenges/${id}`, payload).then((res) => res.data),
  deleteCodingChallenge: (id) => api.delete(`/admin/coding-challenges/${id}`).then((res) => res.data),
  getStudentCoding: (id) => api.get(`/admin/students/${id}/coding`).then((res) => res.data),

  broadcastNotification: (payload) => api.post("/admin/notifications/broadcast", payload).then((res) => res.data),
};
