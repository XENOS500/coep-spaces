import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="section-container page-error-box not-found-wrapper">
      <div className="error-code-badge">404</div>
      <h2>Page Not Found</h2>
      <p>The page or campus wing you requested could not be located.</p>
      <button type="button" className="primary-btn" onClick={() => navigate('/')}>
        ← Return to COEP Spaces Home
      </button>
    </div>
  )
}
