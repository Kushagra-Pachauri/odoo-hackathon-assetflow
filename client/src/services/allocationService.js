import api from "./api";

export const allocateAsset = async (payload) => {
  const { data } = await api.post("/allocations", payload);
  return data;
};

export const getAllocations = async () => {
  const { data } = await api.get("/allocations");
  return data;
};

export const returnAsset = async (id, payload) => {
  // backend currently doesn't use the payload (condition notes) but we send it for future support
  const { data } = await api.put(`/allocations/${id}/return`, payload);
  return data;
};
