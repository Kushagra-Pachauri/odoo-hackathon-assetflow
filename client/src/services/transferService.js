import api from "./api";

export const createTransferRequest = async (payload) => {
  const { data } = await api.post("/transfers", payload);
  return data;
};

export const getTransferRequests = async () => {
  const { data } = await api.get("/transfers");
  return data;
};

export const approveTransfer = async (id) => {
  const { data } = await api.put(`/transfers/${id}/approve`);
  return data;
};
