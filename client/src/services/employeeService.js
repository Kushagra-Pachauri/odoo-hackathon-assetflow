import api from "./api";

export const getEmployees = async () => {
  const { data } = await api.get("/employees");
  return data;
};

export const getEmployee = async (id) => {
  const { data } = await api.get(`/employees/${id}`);
  return data;
};

export const updateEmployee = async (id, payload) => {
  const { data } = await api.put(`/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/employees/${id}`);
  return data;
};

export const promoteEmployee = async (id) => {
  const { data } = await api.patch(`/employees/${id}/role`);
  return data;
};
