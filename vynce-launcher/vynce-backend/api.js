// ==========================================================
// 🔥 VYNCE API CLIENT — Centralized Backend Communication
// ==========================================================

// 🌐 Backend Root
const BASE_URL = "https://vynce-backend.onrender.com"; 
// If local: "http://localhost:5000"

const headers = {
  "Content-Type": "application/json",
};

// ==========================================================
// 🔹 Helper: Handle Safe Requests
// ==========================================================
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }

    return await res.json();
  } catch (err) {
    console.error("API ERROR:", err.message);
    return { error: err.message };
  }
}

// ==========================================================
// 🔥 1. Launcher Config
// ==========================================================
export async function fetchLauncherConfig() {
  return apiRequest("/api/launcher/config");
}

// ==========================================================
// 🔥 2. Auth — VUID Creation (Step 1)
// ==========================================================
export async function createVuid() {
  return apiRequest("/api/auth/uid", {
    method: "POST",
  });
}

// ==========================================================
// 🔥 3. Auth — Username Check (Step 2)
// ==========================================================
export async function checkUsername(username) {
  return apiRequest("/api/auth/check-username", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}

// ==========================================================
// 🔥 4. Auth — Set Username + Display Name (Step 2 Finalize)
// ==========================================================
export async function setUserIdentity(vuid, username, displayName) {
  return apiRequest("/api/auth/set-identity", {
    method: "POST",
    body: JSON.stringify({ vuid, username, displayName }),
  });
}

// ==========================================================
// 🔥 5. Auth — Age Verification (Step 3)
// ==========================================================
export async function verifyAge(vuid, age, parentPasskey = null) {
  return apiRequest("/api/auth/verify-age", {
    method: "POST",
    body: JSON.stringify({ vuid, age, parentPasskey }),
  });
}

// ==========================================================
// 🔥 6. Admin — Live Monitoring (Step 4)
// ==========================================================
export async function adminFetchLiveUsers() {
  return apiRequest("/api/admin/live-users");
}

export async function adminFetchEvents() {
  return apiRequest("/api/admin/events");
}

// ==========================================================
// 🔥 7. Sessions — Token Refresh, Session Validation
// ==========================================================
export async function refreshToken(refreshToken) {
  return apiRequest("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function validateSession(accessToken) {
  return apiRequest("/api/auth/validate", {
    method: "POST",
    body: JSON.stringify({ accessToken }),
  });
}

// ==========================================================
// 🔥 8. Universal Logging
// ==========================================================
export async function clientLog(event, metadata = {}) {
  return apiRequest("/api/logs/client", {
    method: "POST",
    body: JSON.stringify({ event, metadata }),
  });
}
