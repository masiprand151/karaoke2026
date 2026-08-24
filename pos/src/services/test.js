import api from "./api";

export const testConnect = async () => {
  return api.get("/test");
};
