
import { useState } from 'react'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'

// Temporary data for developing the approvals interface.
const initialBookings = [
  {
    id: 'BK-1024',
    requester: 'Aarav Kulkarni',
    email: 'aarav@example.com',
    venue: 'Main Auditorium',
    date: '2026-11-05',
    startTime: '10:00',
    endTime: '12:00',
    attendees: 120,
    purpose: 'Technical workshop',
    status: 'PENDING',
  },
  {
    id: 'BK-1025',
    requester: 'Mira Shah',
    email: 'mira@example.com',
    venue: 'Seminar Hall 1',
    date: '2026-11-06',
    startTime: '14:00',
    endTime: '16:00',
    attendees: 45,
    purpose: 'Student club meeting',
    status: 'PENDING',
  },
  {
    id: 'BK-1026',
    requester: 'Dev Patil',
    email: 'dev@example.com',
    venue: 'Classroom B204',
    date: '2026-11-07',
    startTime: '09:00',
    endTime: '11:00',
    attendees: 25,
    purpose: 'Project discussion',
    status: 'PENDING',
  },
]

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(time) {
  const [hours, minutes] = time.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ApprovalsPage() {
  const [bookings, setBookings] = useState(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [message, setMessage] = useState('')

  // Only pending requests need to appear in this table.
  const pendingBookings = bookings.filter(
    (booking) => booking.status === 'PENDING'
  )

  // Demo action: update the request locally.
function handleDecision(bookingId, decision) {
  setBookings((currentBookings) =>
    currentBookings.map((booking) =>
      booking.id === bookingId
        ? { ...booking, status: decision }
        : booking
    )
  )

  setMessage(
    `Booking ${bookingId} marked ${decision.toLowerCase()}.`
  )
  setSelectedBooking(null)
}

  return (
    <main className="approvals-page">
      <Navbar />

      <section className="approvals-heading">
        <p className="eyebrow">COEP / APPROVER DESK</p>
        <h1>Booking <span>approvals.</span></h1>
        <p>
          Review venue requests, check event details and make
          approval decisions.
        </p>
      </section>

      <section className="approvals-content">
        <div className="approvals-topline">
          <div>
            <h2>Pending requests</h2>
            <p>Requests waiting for your decision.</p>
          </div>

          <div className="pending-count">
            <strong>{pendingBookings.length}</strong>
            <span>AWAITING REVIEW</span>
          </div>
        </div>

        {message && (
          <p className="approval-message" role="status">
            {message}
          </p>
        )}

        {pendingBookings.length > 0 ? (
          <div className="approvals-table-wrapper">
            <table className="approvals-table">
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Venue & event</th>
                  <th>Date & time</th>
                  <th>Attendees</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pendingBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.requester}</strong>
                      <span className="table-secondary">
                        {booking.email}
                      </span>
                      <span className="table-reference">
                        {booking.id}
                      </span>
                    </td>

                    <td>
                      <strong>{booking.venue}</strong>
                      <span className="table-secondary">
                        {booking.purpose}
                      </span>
                    </td>

                    <td>
                      <strong>{formatDate(booking.date)}</strong>
                      <span className="table-secondary">
                        {formatTime(booking.startTime)} –{' '}
                        {formatTime(booking.endTime)}
                      </span>
                    </td>

                    <td>{booking.attendees}</td>

                    <td>
                      <div className="approval-actions">
                        <button
                          type="button"
                          className="approve-button"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          Approve
                        </button>

                     <button
                            type="button"
                            className="reject-button"
                            onClick={() =>
                                setSelectedBooking({
                                ...booking,
                                decision: 'REJECTED',
                                })
                            }
                            >
                            Reject
                </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="approvals-empty">
            <span className="empty-mark">✓</span>
            <h3>All caught up.</h3>
            <p>There are no pending booking requests to review.</p>
          </div>
        )}

        <p className="approval-demo-note">
          Demo mode: decisions update this page only. Persistent
          approvals require the backend API.
        </p>
      </section>

      <Footer />

      {selectedBooking && (
  <div
    className="approval-dialog-backdrop"
    onClick={() => setSelectedBooking(null)}
  >
    <section
      className="approval-dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="approval-dialog-title"
      aria-describedby="approval-dialog-description"
      onClick={(event) => event.stopPropagation()}
    >
      <p className="eyebrow">FINAL CHECK</p>

      <h2 id="approval-dialog-title">
        {selectedBooking.decision === 'REJECTED'
          ? 'Reject this request?'
          : 'Approve this request?'}
      </h2>

      <p id="approval-dialog-description">
        You are about to{' '}
        <strong>
          {selectedBooking.decision === 'REJECTED'
            ? 'reject'
            : 'approve'}
        </strong>{' '}
        the booking for <strong>{selectedBooking.venue}</strong>,
        requested by <strong>{selectedBooking.requester}</strong> on{' '}
        <strong>{formatDate(selectedBooking.date)}</strong>.
      </p>

      <div className="approval-dialog-actions">
        <button
          type="button"
          className="dialog-cancel-button"
          onClick={() => setSelectedBooking(null)}
        >
          Go back
        </button>

        <button
          type="button"
          className={
            selectedBooking.decision === 'REJECTED'
              ? 'dialog-reject-button'
              : 'dialog-confirm-button'
          }
          onClick={() =>
            handleDecision(
              selectedBooking.id,
              selectedBooking.decision || 'APPROVED'
            )
          }
        >
          {selectedBooking.decision === 'REJECTED'
            ? 'Confirm rejection'
            : 'Confirm approval'}
        </button>
      </div>
    </section>
  </div>
)}
    </main>
  )
}

export default ApprovalsPage
