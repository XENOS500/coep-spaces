import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../services/authContext.js";

export default function RequireAuth({ roles }) {
  const { user, loading, error, retry } = useAuth();
  if (loading) return <main className="auth-page"><p role="status">Checking your session...</p></main>;
  if (error) return <main className="auth-page"><p role="alert">{error}</p><button onClick={retry}>Try again</button></main>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <main className="auth-page"><h1>Access denied</h1><p>Your account does not have access to this page.</p><Link to="/">Back to home</Link></main>;
  return <Outlet />;
}
