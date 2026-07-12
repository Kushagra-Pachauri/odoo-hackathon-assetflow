import api from "./api";

export const createMaintenanceRequest = async (payload) => {
  const { data } = await api.post("/maintenance", payload);
  return data;
};

export const getMaintenanceRequests = async () => {
  const { data } = await api.get("/maintenance");
  return data;
};

export const approveMaintenance = async (id, payload) => {
  const { data } = await api.put(`/maintenance/${id}/approve`, payload);
  return data;
};

export const resolveMaintenance = async (id) => {
  const { data } = await api.put(`/maintenance/${id}/resolve`);
  return data;
};
