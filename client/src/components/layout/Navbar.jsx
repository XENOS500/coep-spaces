import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Institutional Branding */}
        <Link to="/" className="brand-logo" aria-label="COEP Venue Booking System">
          <div className="brand-crest">
            <span className="brand-crest-text">COEP</span>
          </div>
          <div className="brand-meta">
            <span className="brand-title">COEP Technological University</span>
            <span className="brand-subtitle">Venue Booking System</span>
          </div>
        </Link>

        {/* Navigation Links per PRD Section 2 */}
        <nav className="nav-links" aria-label="Primary Navigation">
          <NavLink
            to="/venues"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Venue Catalog
          </NavLink>

          <NavLink
            to="/availability"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Check Availability
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            Calendar
          </NavLink>

          {/* REQUESTER navigation */}
          {isAuthenticated && user.role === 'REQUESTER' && (
            <>
              <NavLink
                to="/book"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                New Booking
              </NavLink>
              <NavLink
                to="/my-bookings"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                My Bookings
              </NavLink>
            </>
          )}

          {/* APPROVER navigation */}
          {isAuthenticated && user.role === 'APPROVER' && (
            <>
              <NavLink
                to="/approver/requests"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Pending Requests
              </NavLink>
              <NavLink
                to="/approver/history"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Approval History
              </NavLink>
            </>
          )}

          {/* ADMIN navigation */}
          {isAuthenticated && user.role === 'ADMIN' && (
            <>
              <NavLink
                to="/admin/venues"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Manage Venues
              </NavLink>
              <NavLink
                to="/admin/assign-approvers"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                Assign Approvers
              </NavLink>
            </>
          )}
        </nav>

        {/* Account and Session Controls */}
        <div className="nav-account-controls">
          {isAuthenticated ? (
            <div className="account-menu">
              <div className="account-details">
                <span className="account-name">{user.name}</span>
                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                  {user.email === 'student.lead@coep.ac.in'
                    ? 'Student Lead'
                    : user.email === 'requester@coep.ac.in'
                    ? 'Coordinator'
                    : user.role === 'APPROVER'
                    ? 'HOD / Approver'
                    : 'Administrator'}
                </span>
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="account-anon">
              <button
                type="button"
                className="btn-primary btn-sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
