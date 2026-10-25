import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTarget = searchParams.get('redirect') || '/venues'

  const { login, seedAccounts, user, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')

    try {
      login(email, password)
      navigate(redirectTarget)
    } catch (err) {
      setLoginError(err.message)
    }
  }

  const handleQuickFill = (acc) => {
    setEmail(acc.email)
    setPassword(acc.password)
    setLoginError('')
    try {
      login(acc.email, acc.password)
      navigate(redirectTarget)
    } catch (err) {
      setLoginError(err.message)
    }
  }

  return (
    <div className="login-page-shell">
      <div className="login-container-card">
        <div className="login-header">
          <div className="brand-crest-large">COEP</div>
          <h1 className="login-title">Institutional Single Sign-On</h1>
          <p className="login-subtitle">
            COEP Technological University &bull; Internal Venue Reservation System
          </p>
        </div>

        {loginError && (
          <div className="alert-box alert-danger" style={{ marginBottom: '18px' }}>
            {loginError}
          </div>
        )}

        {isAuthenticated ? (
          <div className="already-authenticated-box">
            <p>
              Signed in as <strong>{user.name}</strong> ({user.email}) with role <strong>{user.role}</strong>.
            </p>
            <div className="modal-actions-row" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="btn-primary btn-block"
                onClick={() => navigate(redirectTarget)}
              >
                Proceed to Portal &rarr;
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label htmlFor="auth-email">Institutional Email Address</label>
              <input
                id="auth-email"
                type="email"
                className="input-text"
                placeholder="name@coep.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                className="input-text"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="login-submit-area">
              <button type="submit" className="btn-primary btn-block">
                Authenticate & Sign In
              </button>
            </div>
          </form>
        )}

        {/* Pre-provisioned test directory per PRD Section 2 */}
        <div className="seed-accounts-section">
          <h4 className="seed-section-title">Pre-Provisioned Institutional Directory (Demo Access)</h4>
          <p className="seed-section-desc">
            Public registration is disabled per PRD Section 2. Accounts are provisioned through trusted administrative seeding. Select an account below to sign in:
          </p>

          <div className="seed-table-wrap">
            <table className="seed-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Account Name</th>
                  <th>Email</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {seedAccounts.map((acc) => (
                  <tr key={acc.id}>
                    <td>
                      <span className={`role-badge role-${acc.role.toLowerCase()}`}>
                        {acc.role}
                      </span>
                    </td>
                    <td>
                      <strong>{acc.name}</strong>
                      <span className="table-subtext">{acc.department}</span>
                    </td>
                    <td className="cell-mono">{acc.email}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary btn-xs"
                        onClick={() => handleQuickFill(acc)}
                      >
                        Sign In as {acc.role}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
