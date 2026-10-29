
import { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { api, saveSession } from "../../services/api.js";
import Brand from "../../components/Brand.jsx";

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  if (loading) return;

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  if (password.length < 8 || password.length > 72) {
    setError("Password must contain 8–72 characters.");
    return;
  }

  setLoading(true);

  try {
    const data = await api("/auth/register", {
      method: "POST",
      body: {
        name: name.trim(),
        email: email.trim(),
        password,
      },
    });

    saveSession(data);
    navigate("/venues", { replace: true });
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
          <Brand />
        </Link>

        <Link to="/login" className="auth-back-link">
          Already registered? Sign in
        </Link>
      </header>

      <section className="auth-layout">
        <div className="auth-intro">
          <p className="eyebrow">GET STARTED</p>

          <h1>
            Your campus.
            <br />
            Your <span>next move.</span>
          </h1>

          <p>
            Create your account to discover campus venues,
            submit booking requests and follow their status.
          </p>

          <div className="auth-side-note">
            COEP SPACES / ONE CAMPUS, MANY POSSIBILITIES
          </div>
        </div>

        <div className="auth-card">
          <p className="eyebrow">NEW ACCOUNT</p>
          <h2>Create account</h2>

          <p className="auth-card-description">
            Enter your details to get started.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

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
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Enter the password again"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                required
              />
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default RegisterPage
