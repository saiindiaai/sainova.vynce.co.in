const API_BASE = "http://127.0.0.1:5000/api";

export async function fetchLauncherConfig() {
  const res = await fetch(`${API_BASE}/launcher/config`);
  return res.json();
}
