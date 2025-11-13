export async function fetchLauncherConfig() {
  const res = await fetch("https://vynce-backend.onrender.com/api/launcher/config");
  return await res.json();
}
