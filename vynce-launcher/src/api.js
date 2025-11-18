import axios from "axios";

export const BASE_URL = "https://vynce-backend.onrender.com/api";

export const createGuestAccount = async () => {
  const res = await axios.post(`${BASE_URL}/auth/guest`);
  return res.data;
};
