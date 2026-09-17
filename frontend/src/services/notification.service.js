import api from "./api";

export const notificationService = {
  list: () => api.get("/notifications").then((res) => res.data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: () => api.patch("/notifications/read-all").then((res) => res.data),
};
