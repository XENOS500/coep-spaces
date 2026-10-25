import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function MyBookingsPage() {
  const { bookings, venues, cancelBooking, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeFilter, setActiveFilter] = useState('ALL')
  const [cancellingBookingId, setCancellingBookingId] = useState(null)
  const [cancelError, setCancelError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  if (!isAuthenticated) {
    navigate('/login?redirect=/my-bookings')
    return null
  }

  // Filter own bookings per PRD Section 2
  const ownBookings = bookings.filter((b) => b.requesterId === user.id)

  const filteredBookings = ownBookings.filter((b) => {
    if (activeFilter === 'ALL') return true
    return b.status === activeFilter
  })

  // Handle cancellation per PRD Section 4 Rule 7
  const handleConfirmCancel = () => {
    if (!cancellingBookingId) return
    setCancelError('')
    try {
      cancelBooking(cancellingBookingId)
      setSuccessMessage(`Booking Requisition #${cancellingBookingId} and all its occurrences have been cancelled. Reserved slots released.`)
      setCancellingBookingId(null)
    } catch (err) {
      setCancelError(err.message)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">My Bookings</span>
          </div>

          <div className="header-title-row">
            <div>
              <h1 className="header-title">My Venue Requisitions</h1>
              <p className="header-desc">
                Official requisition log for <strong>{user.name}</strong> ({user.department}). Track approver decisions and cancel eligible bookings.
              </p>
            </div>

            <button type="button" className="btn-primary" onClick={() => navigate('/book')}>
              New Booking Requisition
            </button>
          </div>
        </div>
      </div>

      <div className="container page-content">
        {location.state?.submittedBookingId && (
          <div className="alert-box alert-success" style={{ marginBottom: '20px' }}>
            <strong>Requisition #{location.state.submittedBookingId} Submitted:</strong> Your booking series has been registered as PENDING and routed to the assigned venue approver.
          </div>
        )}

        {successMessage && (
          <div className="alert-box alert-success" style={{ marginBottom: '20px' }}>
            {successMessage}
          </div>
        )}

        {cancelError && (
          <div className="alert-box alert-danger" style={{ marginBottom: '20px' }}>
            {cancelError}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="filters-bottom-row" style={{ marginBottom: '24px' }}>
          <div className="tab-pill-group">
            <button
              type="button"
              className={`btn-toggle ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              All Records ({ownBookings.length})
            </button>
            <button
              type="button"
              className={`btn-toggle ${activeFilter === 'PENDING' ? 'active' : ''}`}
              onClick={() => setActiveFilter('PENDING')}
            >
              Pending ({ownBookings.filter((b) => b.status === 'PENDING').length})
            </button>
            <button
              type="button"
              className={`btn-toggle ${activeFilter === 'APPROVED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('APPROVED')}
            >
              Approved ({ownBookings.filter((b) => b.status === 'APPROVED').length})
            </button>
            <button
              type="button"
              className={`btn-toggle ${activeFilter === 'REJECTED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('REJECTED')}
            >
              Rejected ({ownBookings.filter((b) => b.status === 'REJECTED').length})
            </button>
            <button
              type="button"
              className={`btn-toggle ${activeFilter === 'CANCELLED' ? 'active' : ''}`}
              onClick={() => setActiveFilter('CANCELLED')}
            >
              Cancelled ({ownBookings.filter((b) => b.status === 'CANCELLED').length})
            </button>
          </div>
        </div>

        {/* Bookings Stack */}
        {filteredBookings.length === 0 ? (
          <div className="empty-state-panel">
            <h3>No Requisitions Recorded</h3>
            <p>You currently have no booking requisitions matching this status.</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/book')}>
              Submit a Venue Requisition
            </button>
          </div>
        ) : (
          <div className="requisition-list-stack">
            {filteredBookings.map((b) => {
              const venue = venues.find((v) => v.id === b.venueId)
              const firstOcc = b.occurrences[0]
              const now = new Date()
              const isFuture = firstOcc ? now < new Date(`${firstOcc.date}T${firstOcc.startsAt}:00`) : false
              const canCancel = (b.status === 'PENDING' || b.status === 'APPROVED') && isFuture

              return (
                <div key={b.id} className="card-section booking-record-card">
                  <div className="booking-card-header">
                    <div>
                      <span className="booking-ref-badge">Requisition ID: #{b.id}</span>
                      <h3 className="booking-card-title">{b.eventTitle}</h3>
                      <span className="booking-venue-sub">
                        {venue?.name} &bull; {venue?.buildingName} ({venue?.floor})
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
                      <span className="detail-key">Event Type</span>
                      <span className="detail-val">{b.eventType}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Attendees</span>
                      <span className="detail-val">{b.guestCount} Persons</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Scheduled Range</span>
                      <span className="detail-val">{b.startDate} to {b.endDate}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Daily Time Slot</span>
                      <span className="detail-val">{b.localStartTime} – {b.localEndTime}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Contact</span>
                      <span className="detail-val">{b.contactName} ({b.contactPhone})</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-key">Occurrences</span>
                      <span className="detail-val">{b.occurrences.length} Total Sessions</span>
                    </div>
                  </div>

                  <div className="booking-details-notes">
                    <strong>Institutional Purpose:</strong> {b.purpose}
                  </div>

                  {b.actions.length > 0 && (
                    <div className="decision-history-strip">
                      <strong>Approver Decision History:</strong>
                      {b.actions.map((act) => (
                        <div key={act.id} className="history-action-entry">
                          &bull; <strong>{act.action}</strong> by {act.actorName} on {new Date(act.createdAt).toLocaleString()} — Reason: "{act.reason}"
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="booking-card-footer">
                    <span className="table-subtext">Submitted: {new Date(b.createdAt).toLocaleString()}</span>

                    {canCancel && (
                      <button
                        type="button"
                        className="btn-danger-outline btn-sm"
                        onClick={() => setCancellingBookingId(b.id)}
                      >
                        Cancel Whole Series
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancellation Modal Confirmation Dialog */}
      {cancellingBookingId && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3 className="modal-title">Confirm Requisition Cancellation</h3>
            <p className="modal-body-text">
              Are you certain you wish to cancel Requisition #{cancellingBookingId}? Per institutional policy, cancellation releases all occurrences across the series immediately. This operation cannot be undone.
            </p>
            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCancellingBookingId(null)}
              >
                Retain Booking
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleConfirmCancel}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
