import { useEffect, useState } from "react";
import { AuthContext } from "../services/authContext.js";
import { api, clearSession, getUser } from "../services/api.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    function sessionChanged() {
      controller.abort();
      setUser(getUser());
      setError("");
      setLoading(false);
    }
    window.addEventListener("coep-auth-changed", sessionChanged);
    async function restore() {
      try {
        setLoading(true);
        setError("");
        if (!sessionStorage.getItem("coepToken")) {
          setUser(null);
          return;
        }
        const data = await api("/auth/me", { signal: controller.signal });
        if (!controller.signal.aborted) {
          sessionStorage.setItem("coepUser", JSON.stringify(data.user));
          setUser(data.user);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setUser(null);
          if (err.status === 401) clearSession();
          else setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    restore();
    return () => {
      controller.abort();
      window.removeEventListener("coep-auth-changed", sessionChanged);
    };
  }, [attempt]);

  return <AuthContext.Provider value={{ user, loading, error, retry: () => setAttempt(value => value + 1) }}>{children}</AuthContext.Provider>;
}
