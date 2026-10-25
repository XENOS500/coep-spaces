import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function VenueDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { venues, approverAssignments, seedAccounts, user, isAuthenticated } = useAuth()

  const venue = venues.find((v) => v.id === id || v.sourceSerial === parseInt(id, 10))

  if (!venue) {
    return (
      <div className="container page-content">
        <div className="error-panel">
          <h2>Facility Not Located</h2>
          <p>The specified venue identifier does not correspond to an active record in the catalog.</p>
          <Link to="/venues" className="btn-secondary">Return to Venue Catalog</Link>
        </div>
      </div>
    )
  }

  const isVerifiedCapacity = venue.capacity !== null && venue.capacity > 0
  const assignedApproverIds = approverAssignments[venue.id] || []
  const hasApprover = assignedApproverIds.length > 0
  const canBook = venue.bookingEnabled && isVerifiedCapacity && hasApprover

  // Resolve assigned approver names
  const assignedApprovers = assignedApproverIds.map((appId) => {
    const acc = seedAccounts.find((a) => a.id === appId)
    return acc ? `${acc.name} (${acc.department})` : appId
  })

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/book/${venue.id}`)
    } else if (user.role === 'REQUESTER') {
      navigate(`/book/${venue.id}`)
    } else {
      alert(`Accounts with role ${user.role} cannot submit booking requests. Please sign in with a REQUESTER account.`)
    }
  }

  return (
    <div className="page-shell">
      {/* Breadcrumb Header */}
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <Link to="/venues">Venue Catalog</Link>
            <span className="sep">/</span>
            <span className="current">{venue.name}</span>
          </div>

          <div className="header-title-row">
            <div>
              <div className="venue-meta-pills">
                <span className="venue-serial">Record Sr No. {venue.sourceSerial}</span>
                <span className="badge-type">{venue.venueType}</span>
                {canBook ? (
                  <span className="badge-status-active">Eligible for Booking</span>
                ) : (
                  <span className="badge-status-blocked">Booking Blocked</span>
                )}
              </div>
              <h1 className="header-title">{venue.name}</h1>
              <p className="header-desc">
                {venue.buildingName} &bull; {venue.floor} &bull; Room Code: {venue.roomReferenceRaw || 'Not provided'}
              </p>
            </div>

            <div className="header-actions">
              <Link to={`/availability?venueId=${venue.id}`} className="btn-secondary">
                Check Availability
              </Link>
              {canBook && (
                <button type="button" className="btn-primary" onClick={handleBookClick}>
                  Submit Requisition
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="container page-content">
        {/* Warning if unverified capacity */}
        {!isVerifiedCapacity && (
          <div className="alert-box alert-warning">
            <strong>Capacity Verification Required:</strong> This venue record (Source Serial {venue.sourceSerial}) does not have an audited seating capacity in the institutional register. Booking requests are blocked until verified by campus administration.
          </div>
        )}

        {/* Warning if no approver assigned per PRD Section 4 Rule 8 */}
        {isVerifiedCapacity && !hasApprover && (
          <div className="alert-box alert-warning">
            <strong>Approver Assignment Required:</strong> No active APPROVER is currently assigned to this facility. Per institutional policy, an unassigned venue cannot accept new booking requests until assigned by an administrator.
          </div>
        )}

        <div className="details-two-col-grid">
          {/* Main Column */}
          <div className="details-primary-column">
            {/* Visual media */}
            <div className="details-image-panel">
              {venue.imageSourceUrl ? (
                <img src={venue.imageSourceUrl} alt={venue.name} className="details-full-img" />
              ) : (
                <div className="details-fallback-banner">
                  <span className="fallback-title">{venue.name}</span>
                  <span className="fallback-subtitle">{venue.buildingName}</span>
                  <span className="fallback-note">Photographic asset not verified in workbook</span>
                </div>
              )}
            </div>

            {/* Technical Specifications Table */}
            <div className="card-section">
              <h2 className="card-section-title">Facility Specifications & Allowed Uses</h2>
              <dl className="specs-data-grid">
                <div className="spec-data-cell">
                  <dt>Building Name</dt>
                  <dd>{venue.buildingName}</dd>
                </div>

                <div className="spec-data-cell">
                  <dt>Floor / Level</dt>
                  <dd>{venue.floor}</dd>
                </div>

                <div className="spec-data-cell">
                  <dt>Room Reference Number</dt>
                  <dd>{venue.roomReferenceRaw || 'Not provided'}</dd>
                </div>

                <div className="spec-data-cell">
                  <dt>Verified Capacity</dt>
                  <dd>
                    {isVerifiedCapacity ? (
                      <strong>{venue.capacity} Persons</strong>
                    ) : (
                      <span className="text-warning">Unverified</span>
                    )}
                  </dd>
                </div>

                <div className="spec-data-cell">
                  <dt>Permitted Operating Hours</dt>
                  <dd>{venue.openingTime} to {venue.closingTime} (Asia/Kolkata)</dd>
                </div>

                <div className="spec-data-cell">
                  <dt>Booking Horizon</dt>
                  <dd>Today through Today + 30 calendar days</dd>
                </div>
              </dl>
            </div>

            {/* Features & Permitted Uses */}
            <div className="card-section">
              <h2 className="card-section-title">Installed Features & Equipment</h2>
              <p className="section-body-text">
                {venue.features || 'No installed features specified in institutional register.'}
              </p>

              <h2 className="card-section-title" style={{ marginTop: '24px' }}>Permitted Venue Uses</h2>
              <p className="section-body-text">
                {venue.allowedUses || 'Standard academic instruction and departmental use.'}
              </p>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="details-sidebar-column">
            {/* Reservation Summary Card */}
            <div className="card-sidebar">
              <h3 className="card-sidebar-title">Reservation Eligibility</h3>
              <ul className="sidebar-checklist">
                <li>
                  <span className="check-bullet">&bull;</span>
                  <span><strong>Classification:</strong> {venue.venueType}</span>
                </li>
                <li>
                  <span className="check-bullet">&bull;</span>
                  <span><strong>Schedule Limit:</strong> Advance booking up to 30 days</span>
                </li>
                <li>
                  <span className="check-bullet">&bull;</span>
                  <span><strong>Opening Hours:</strong> {venue.openingTime} – {venue.closingTime}</span>
                </li>
                <li>
                  <span className="check-bullet">&bull;</span>
                  <span>
                    <strong>Assigned Approver:</strong>{' '}
                    {hasApprover ? (
                      assignedApprovers.join(', ')
                    ) : (
                      <span className="text-warning">None assigned</span>
                    )}
                  </span>
                </li>
              </ul>

              <div className="sidebar-action-box">
                {canBook ? (
                  <button type="button" className="btn-primary btn-block" onClick={handleBookClick}>
                    Submit Requisition
                  </button>
                ) : (
                  <button type="button" className="btn-disabled btn-block" disabled>
                    Booking Disabled
                  </button>
                )}
                <Link
                  to={`/availability?venueId=${venue.id}`}
                  className="btn-secondary btn-block"
                  style={{ marginTop: '10px' }}
                >
                  Inspect Calendar Slots
                </Link>
              </div>

              <div className="sidebar-footer-note">
                <span>All booking submissions are subject to review by the designated venue approver. Overlapping reservations are automatically rejected.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
