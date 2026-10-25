import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-inner">
        <div className="footer-info">
          <span className="footer-org">COEP Technological University</span>
          <span className="footer-addr">Wellesley Road, Shivajinagar, Pune 411 005, Maharashtra, India</span>
          <span className="footer-desc">Internal Venue Reservation and Allocation System — Version 2.0</span>
        </div>

        <div className="footer-nav">
          <Link to="/venues">Venue Catalog</Link>
          <Link to="/availability">Availability Search</Link>
          <Link to="/calendar">Master Calendar</Link>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
      <div className="footer-bottom-bar">
        <span>&copy; {new Date().getFullYear()} COEP Technological University. All rights reserved.</span>
        <span>Advance booking horizon: 30 calendar days (Asia/Kolkata).</span>
      </div>
    </footer>
  )
}
