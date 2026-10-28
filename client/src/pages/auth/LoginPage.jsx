
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveSession } from "../../services/api.js";

function LoginPage() {
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
    const data = await api("/auth/login", {
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
    <main className="auth-page">
      <header className="auth-header">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          <span>COEP Spaces</span>
        </Link>

        <Link to="/" className="auth-back-link">
          Back to home
        </Link>
      </header>

      <section className="auth-layout">
        <div className="auth-intro">
          <p className="eyebrow">YOUR CAMPUS, YOUR SPACE</p>

          <h1>
            Good ideas need
            <br />
            <span>the right place.</span>
          </h1>

          <p>
            Sign in to request campus venues, manage your bookings,
            or review requests assigned to you.
          </p>

          <div className="auth-side-note">
            COEP SPACES / CAMPUS VENUE MANAGEMENT
          </div>
        </div>

        <div className="auth-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in</h2>
          <p className="auth-card-description">
            Enter your email and password to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
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
               {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New to COEP Spaces?{" "}
            <Link to="/register">Create an account</Link>
          </p>

          
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
