const API_BASE = (import.meta.env?.VITE_API_URL || "/api").replace(/\/$/, "");

export function getUser() {
  try { return JSON.parse(sessionStorage.getItem("coepUser") || "null"); }
  catch { return null; }
}

export function saveSession(data) {
  sessionStorage.setItem("coepToken", data.token);
  sessionStorage.setItem("coepUser", JSON.stringify(data.user));
  window.dispatchEvent(new Event("coep-auth-changed"));
}

export function clearSession() {
  sessionStorage.removeItem("coepToken");
  sessionStorage.removeItem("coepUser");
  window.dispatchEvent(new Event("coep-auth-changed"));
}

export async function api(path, { method = "GET", body, signal } = {}) {
  const token = sessionStorage.getItem("coepToken");
  const response = await fetch(API_BASE + path, {
    method, signal,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token === sessionStorage.getItem("coepToken")) clearSession();
    const error = new Error(data?.message || "Request failed (" + response.status + ")");
    error.status = response.status;
    throw error;
  }
  if (response.status !== 204 && data === null) throw new Error("The server returned an invalid response. Please try again.");
  return data;
}
