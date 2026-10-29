
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveSession } from "../../services/api.js";
import Brand from "../../components/Brand.jsx";

function LoginPage({ adminOnly = false }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  if (loading) return;

  if (!email.trim() || !password) {
    setError("Please enter your email and password.");
    return;
  }

  setLoading(true);

  try {
    const data = await api(adminOnly ? "/auth/admin/login" : "/auth/login", {
      method: "POST",
      body: {
        email: email.trim(),
        password,
      },
    });

    saveSession(data);

    const destination =
      data.user.role === "ADMIN"
        ? "/admin/venues"
        : data.user.role === "APPROVER"
          ? "/approvals"
          : "/venues";

    navigate(destination, { replace: true });
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  return (
    <main className={`auth-page${adminOnly ? " auth-page--admin" : ""}`}>
      <header className="auth-header">
        <Link to="/" className="brand">
          <Brand />
        </Link>

        <Link to="/" className="auth-back-link">
          Back to home
        </Link>
      </header>

      <section className="auth-layout">
        <div className="auth-intro">
          <p className="eyebrow">{adminOnly ? "COEP SPACES / ADMINISTRATION" : "YOUR CAMPUS, YOUR SPACE"}</p>

          <h1>
            {adminOnly ? "A well-run campus." : "Good ideas need"}
            <br />
            <span>{adminOnly ? "Starts with you." : "the right place."}</span>
          </h1>

          <p>
            {adminOnly ? "Manage campus venues, assign approvers and keep spaces ready for the COEP community." : "Sign in to request campus venues, manage your bookings, or review requests assigned to you."}
          </p>

          <div className="auth-side-note">
            COEP SPACES / CAMPUS VENUE MANAGEMENT
          </div>
        </div>

        <div className="auth-card">
          <p className="eyebrow">{adminOnly ? "ADMINISTRATOR ACCESS" : "WELCOME BACK"}</p>
          <h2>{adminOnly ? "Admin sign in" : "Sign in"}</h2>
          <p className="auth-card-description">
            {adminOnly ? "Enter your administrator email and password to continue." : "Enter your email and password to continue."}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">{adminOnly ? "Administrator email" : "Email address"}</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={adminOnly ? "Your administrator email" : "you@example.com"}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">{adminOnly ? "Administrator password" : "Password"}</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
               {loading ? "Signing in..." : adminOnly ? "Sign in as administrator" : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            {adminOnly ? <>Booking a space? <Link to="/login">Use regular sign in</Link></> : <>New to COEP Spaces? <Link to="/register">Create an account</Link></>}
          </p>
          {!adminOnly && <p className="auth-switch auth-admin-link"><Link to="/admin/login">Administrator sign in ↗</Link></p>}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
