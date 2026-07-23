import api from "./api";

export const AuthAPI = {
  login: (password) => api.post("/auth/login", { password }).then((r) => r.data),
  changePassword: (currentPassword, newPassword) =>
    api.post("/auth/change-password", { currentPassword, newPassword }).then((r) => r.data),
};

export const SettingsAPI = {
  get: () => api.get("/settings").then((r) => r.data),
  update: (data) => api.put("/settings", data).then((r) => r.data),
};

export const BarbersAPI = {
  list: () => api.get("/barbers").then((r) => r.data),
  create: (data) => api.post("/barbers", data).then((r) => r.data),
  update: (id, data) => api.put(`/barbers/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/barbers/${id}`).then((r) => r.data),
};

export const ServicesAPI = {
  list: () => api.get("/services").then((r) => r.data),
  create: (data) => api.post("/services", data).then((r) => r.data),
  update: (id, data) => api.put(`/services/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/services/${id}`).then((r) => r.data),
};

export const AppointmentsAPI = {
  slots: (barberId, date, serviceId) =>
    api.get("/appointments/slots", { params: { barberId, date, serviceId } }).then((r) => r.data.slots),
  createPublic: (data) => api.post("/appointments", data).then((r) => r.data),
  createAdmin: (data) => api.post("/appointments/admin", data).then((r) => r.data),
  list: (params) => api.get("/appointments", { params }).then((r) => r.data),
  update: (id, data) => api.put(`/appointments/${id}`, data).then((r) => r.data),
  complete: (id, consumeCreditType) => api.post(`/appointments/${id}/complete`, consumeCreditType ? { consumeCreditType } : {}).then((r) => r.data),
  cancel: (id) => api.post(`/appointments/${id}/cancel`).then((r) => r.data),
};

export const ClientsAPI = {
  list: () => api.get("/clients").then((r) => r.data),
  create: (data) => api.post("/clients", data).then((r) => r.data),
};

export const TransactionsAPI = {
  list: (params) => api.get("/transactions", { params }).then((r) => r.data),
  createExpense: (data) => api.post("/transactions", data).then((r) => r.data),
  remove: (id) => api.delete(`/transactions/${id}`).then((r) => r.data),
};

export const DashboardAPI = {
  home: () => api.get("/dashboard/home").then((r) => r.data),
  caixa: () => api.get("/dashboard/caixa").then((r) => r.data),
  reports: (period) => api.get("/dashboard/reports", { params: { period } }).then((r) => r.data),
};

export const PlansAPI = {
  list: (all) => api.get("/plans", { params: all ? { all: "1" } : {} }).then((r) => r.data),
  listPublic: () => api.get("/plans/public").then((r) => r.data),
  create: (data) => api.post("/plans", data).then((r) => r.data),
  update: (id, data) => api.put(`/plans/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/plans/${id}`).then((r) => r.data),
};

export const ClientPlansAPI = {
  list: (params) => api.get("/client-plans", { params }).then((r) => r.data),
  activeIds: () => api.get("/client-plans/active-ids").then((r) => r.data),
  alerts: () => api.get("/client-plans/alerts").then((r) => r.data),
  activeForClient: (clientId) => api.get(`/client-plans/active/${clientId}`).then((r) => r.data),
  history: (clientPlanId) => api.get(`/client-plans/${clientPlanId}/history`).then((r) => r.data),
  activate: (clientId, planId) => api.post("/client-plans", { clientId, planId }).then((r) => r.data),
  renew: (clientPlanId) => api.post(`/client-plans/${clientPlanId}/renew`).then((r) => r.data),
};

export const PlanRequestsAPI = {
  createPublic: (data) => api.post("/plan-requests", data).then((r) => r.data),
  list: (status) => api.get("/plan-requests", { params: status ? { status } : {} }).then((r) => r.data),
  activate: (id) => api.post(`/plan-requests/${id}/activate`).then((r) => r.data),
  dismiss: (id) => api.post(`/plan-requests/${id}/dismiss`).then((r) => r.data),
};
