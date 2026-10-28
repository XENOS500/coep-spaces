//This helper adds the login token automatically and shows backend error messages to your pages.

export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem("coepUser") || "null");
  } catch {
    return null;
  }
}

export function saveSession(data) {
  sessionStorage.setItem("coepToken", data.token);
  sessionStorage.setItem("coepUser", JSON.stringify(data.user));
}

export function clearSession() {
  sessionStorage.removeItem("coepToken");
  sessionStorage.removeItem("coepUser");
}

export async function api(path, { method = "GET", body, signal } = {}) {
  const token = sessionStorage.getItem("coepToken");

  const response = await fetch(`/api${path}`, {
    method,
    signal,
    headers: {
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    const error = new Error(
      data?.message || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return data;
}