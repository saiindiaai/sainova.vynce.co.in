export async function fetchLauncherConfig() {
  const res = await fetch("http://127.0.0.1:5000/api/launcher/config");
  return await res.json();
}
