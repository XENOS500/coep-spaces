import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ApprovalsPage() {
  const { bookings, venues, decideBooking, isApproverAssignedToVenue, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine active view: 'pending' or 'history'
  const isHistoryView = location.pathname.includes('history')
  const [activeTab, setActiveTab] = useState(isHistoryView ? 'HISTORY' : 'PENDING')

  const [rejectingBookingId, setRejectingBookingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  if (!isAuthenticated) {
    navigate('/login?redirect=/approver/requests')
    return null
  }

  if (user.role !== 'APPROVER') {
    return (
      <div className="container page-content">
        <div className="error-panel">
          <h2>Access Restricted</h2>
          <p>
            Your current account role is <strong>{user.role}</strong>. Only accounts with role <strong>APPROVER</strong> may access the venue decision desk.
          </p>
          <Link to="/venues" className="btn-secondary">Return to Venue Catalog</Link>
        </div>
      </div>
    )
  }

  // Filter requests for assigned venues only per PRD Section 2
  const assignedVenueBookings = bookings.filter((b) => isApproverAssignedToVenue(user.id, b.venueId))

  const pendingRequests = assignedVenueBookings.filter((b) => b.status === 'PENDING')
  const historyRequests = assignedVenueBookings.filter((b) => b.status === 'APPROVED' || b.status === 'REJECTED')

  const displayedList = activeTab === 'PENDING' ? pendingRequests : historyRequests

  const handleApprove = (bookingId) => {
    setActionError('')
    setActionSuccess('')
    try {
      decideBooking(bookingId, 'APPROVED', 'Sanctioned in accordance with institutional venue allocation policy.')
      setActionSuccess(`Requisition #${bookingId} has been successfully APPROVED. Slots are officially reserved.`)
    } catch (err) {
      setActionError(err.message)
    }
  }

  const handleRejectSubmit = (e) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')

    if (!rejectionReason.trim()) {
      setActionError('A specific administrative reason is mandatory when declining a booking request.')
      return
    }

    try {
      decideBooking(rejectingBookingId, 'REJECTED', rejectionReason.trim())
      setActionSuccess(`Requisition #${rejectingBookingId} has been REJECTED. Requester notified of reason.`)
      setRejectingBookingId(null)
      setRejectionReason('')
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Approver Decision Desk</span>
          </div>

          <div className="header-title-row">
            <div>
              <h1 className="header-title">Venue Allocation & Decision Desk</h1>
              <p className="header-desc">
                Review pending requisitions for assigned facilities. Approver: <strong>{user.name}</strong> ({user.department}).
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container page-content">
        {actionSuccess && (
          <div className="alert-box alert-success" style={{ marginBottom: '20px' }}>
            {actionSuccess}
          </div>
        )}

        {actionError && (
          <div className="alert-box alert-danger" style={{ marginBottom: '20px' }}>
            <strong>Action Error:</strong> {actionError}
          </div>
        )}

        {/* Tab Controls */}
        <div className="filters-bottom-row" style={{ marginBottom: '24px' }}>
          <div className="tab-pill-group">
            <button
              type="button"
              className={`btn-toggle ${activeTab === 'PENDING' ? 'active' : ''}`}
              onClick={() => setActiveTab('PENDING')}
            >
              Action Required: Pending Requests ({pendingRequests.length})
            </button>
            <button
              type="button"
              className={`btn-toggle ${activeTab === 'HISTORY' ? 'active' : ''}`}
              onClick={() => setActiveTab('HISTORY')}
            >
              Decision History ({historyRequests.length})
            </button>
          </div>
        </div>

        {displayedList.length === 0 ? (
          <div className="empty-state-panel">
            <h3>No Records in this Queue</h3>
            <p>
              {activeTab === 'PENDING'
                ? 'All booking requisitions for your assigned venues have been processed.'
                : 'No historical approval or rejection decisions recorded for your assigned facilities yet.'}
            </p>
          </div>
        ) : (
          <div className="requisition-list-stack">
            {displayedList.map((b) => {
              const venue = venues.find((v) => v.id === b.venueId)
              const isSelf = b.requesterId === user.id

              return (
                <div key={b.id} className="card-section booking-record-card">
                  <div className="booking-card-header">
                    <div>
                      <span className="booking-ref-badge">Requisition ID: #{b.id}</span>
                      <h3 className="booking-card-title">{b.eventTitle}</h3>
                      <span className="booking-venue-sub">
                        {venue?.name} &bull; {venue?.buildingName} &bull; Room: {venue?.roomReferenceRaw || 'N/A'}
                      </span>
                    </div>

                    <div className="booking-status-box">
                      <span className={`badge-status-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>

                  <div className="booking-card-details-grid">
                    <div className="detail-field">
                      <span className="detail-key">Applicant Contact</span>
                      <span className="detail-val">{b.contactName} ({b.contactEmail})</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Phone</span>
                      <span className="detail-val">{b.contactPhone}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Classification</span>
                      <span className="detail-val">{b.eventType}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Expected Guests</span>
                      <span className="detail-val">{b.guestCount} / {venue?.capacity} Capacity</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Dates Range</span>
                      <span className="detail-val">{b.startDate} to {b.endDate}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Daily Time Slot</span>
                      <span className="detail-val">{b.localStartTime} – {b.localEndTime}</span>
                    </div>
                  </div>

                  <div className="booking-details-notes">
                    <strong>Institutional Purpose:</strong> {b.purpose}
                    <br />
                    <strong>Event Details:</strong> {b.details}
                  </div>

                  {b.actions.length > 0 && (
                    <div className="decision-history-strip">
                      <strong>Audit Trail:</strong>
                      {b.actions.map((act) => (
                        <div key={act.id} className="history-action-entry">
                          &bull; <strong>{act.action}</strong> by {act.actorName} on {new Date(act.createdAt).toLocaleString()} — Reason: "{act.reason}"
                        </div>
                      ))}
                    </div>
                  )}

                  {b.status === 'PENDING' && (
                    <div className="booking-card-footer">
                      <div>
                        {isSelf && (
                          <span className="text-danger font-semibold">
                            Self-approval prohibited: Another assigned approver must decide this request.
                          </span>
                        )}
                      </div>

                      <div className="action-buttons-inline">
                        <button
                          type="button"
                          className="btn-danger-outline btn-sm"
                          disabled={isSelf}
                          onClick={() => {
                            setRejectingBookingId(b.id)
                            setRejectionReason('')
                            setActionError('')
                          }}
                        >
                          Reject Series
                        </button>

                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          disabled={isSelf}
                          onClick={() => handleApprove(b.id)}
                        >
                          Approve Entire Series
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mandatory Rejection Reason Modal */}
      {rejectingBookingId && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 className="modal-title">Decline Booking Requisition #{rejectingBookingId}</h3>
            <p className="modal-body-text">
              Under institutional guidelines, a written reason is mandatory when declining a facility requisition. This explanation will be recorded in the audit trail and displayed to the requester.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-field">
                <label htmlFor="rejection-reason">Administrative Reason for Rejection</label>
                <textarea
                  id="rejection-reason"
                  rows="3"
                  className="input-textarea"
                  placeholder="Specify conflict, maintenance schedule, or policy restriction..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setRejectingBookingId(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                >
                  Submit Official Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
