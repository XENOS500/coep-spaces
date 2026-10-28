
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BOOKER");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    // Demo role selection only; not secure authentication.
    sessionStorage.setItem("demoRole", role);
    sessionStorage.setItem("demoBookerEmail", email);
    sessionStorage.setItem("demoBookerName", email.split("@")[0]);

    if (role === "APPROVER") {
      sessionStorage.setItem("demoApproverName", email.split("@")[0]);
    }

    setError("");

    if (role === "ADMIN") {
      navigate("/admin/venues");
    } else if (role === "APPROVER") {
      navigate("/approvals");
    } else {
      navigate("/venues");
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
            Enter your details and choose a demo role to continue.
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

            <div className="form-field">
              <label htmlFor="role">Continue as</label>
              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="BOOKER">Booker</option>
                <option value="APPROVER">Approver</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button className="auth-submit" type="submit">
              Continue to dashboard
            </button>
          </form>

          <p className="auth-switch">
            New to COEP Spaces?{" "}
            <Link to="/register">Create an account</Link>
          </p>

          <p className="demo-note">
            Demo mode: role selection does not verify your identity.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
