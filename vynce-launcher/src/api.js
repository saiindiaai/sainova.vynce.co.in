export async function fetchLauncherConfig() {
  const res = await fetch("https://vynce-backend.onrender.com/api/launcher/config");
  return await res.json();
}

export const createGuest = async () => {
  const res = await axios.post(`${BASE_URL}/auth/guest`);
  return res.data;
};
