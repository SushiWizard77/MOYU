import api from "./api";

export const roadmapService = {
  list: () => api.get("/roadmaps").then((res) => res.data),
  get: (slug) => api.get(`/roadmaps/${slug}`).then((res) => res.data),
  toggleTopic: (slug, topicId) => api.post(`/roadmaps/${slug}/toggle-topic`, { topicId }).then((res) => res.data),
};
