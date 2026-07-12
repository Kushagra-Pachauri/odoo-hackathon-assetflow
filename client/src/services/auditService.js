import api from "./api";

export const getAuditLogs = async () => {
  const { data } = await api.get("/audit");
  return data;
};

export const getAuditLogById = async (id) => {
  const { data } = await api.get(`/audit/${id}`);
  return data;
};
