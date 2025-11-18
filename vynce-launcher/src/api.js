// src/api.js
import axios from "axios";

export const BASE_URL = "https://vynce-backend.onrender.com/api";

// Fetch launcher config (used by the launcher UI)
export async function fetchLauncherConfig() {
  const res = await axios.get(`${BASE_URL}/launcher/config`);
  return res.data;
}

// Create a guest account
export const createGuestAccount = async () => {
  const res = await axios.post(`${BASE_URL}/auth/guest`);
  return res.data;
};
