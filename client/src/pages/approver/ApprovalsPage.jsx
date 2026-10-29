
import { useEffect, useState } from "react";

import Footer from "../../components/layout/Footer.jsx";
import { fetchApprovals, decideBooking } from "../../services/bookingApi.js";
import { formatDate, formatTime } from "../../services/dates.js";

function ApprovalsPage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const result = await fetchApprovals(controller.signal);
        if (!controller.signal.aborted) { setBookings(result); setError(""); }
      } catch (err) { if (!controller.signal.aborted) setError(err.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    refresh();
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); };
  }, []);

  const pendingBookings = bookings;

  async function handleDecision(bookingId, decision) {
    if (saving) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await decideBooking(bookingId, decision, rejectionReason);
      setBookings(current => current.filter(item => item.id !== bookingId));
      setSelectedBooking(null);
      setRejectionReason("");
      setMessage("Booking " + decision.toLowerCase() + " successfully.");
    } catch (err) {
      setError(err.message);
      if (err.status === 409 || err.status === 403) {
        setSelectedBooking(null);
        try { setBookings(await fetchApprovals()); } catch { /* Keep the original decision error visible. */ }
      }
    } finally { setSaving(false); }
  }

  return (
    <main className="approvals-page">


      <section className="approvals-heading">
        <p className="eyebrow">COEP / APPROVER DESK</p>
        <h1>
          Booking <span>approvals.</span>
        </h1>
        <p>
          Review requests assigned to you, check event details and make
          approval decisions.
        </p>
      </section>

      <section className="approvals-content">
        <div className="approvals-topline">
          <div>
            <h2>Pending requests</h2>
            <p>Requests for venues assigned to your account.</p>
          </div>

          <div className="pending-count">
            <strong>{pendingBookings.length}</strong>
            <span>AWAITING REVIEW</span>
          </div>
        </div>


        {loading && <p role="status">Loading requests...</p>}
        {error && <p role="alert">{error}</p>}
        {message && (
          <p className="approval-message" role="status">
            {message}
          </p>
        )}

        {!loading && !error && (pendingBookings.length > 0 ? (
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
                      <span className="table-secondary">{booking.email}</span>
                      <span className="table-reference">{booking.id}</span>
                    </td>

                    <td>
                      <strong>{booking.venue}</strong>
                      <span className="table-secondary">{booking.eventName}</span>
                      <span className="table-secondary">{booking.purpose}</span>
                    </td>

                    <td>
                      <strong>{formatDate(booking.date)}</strong>
                      <span className="table-secondary">
                        {formatTime(booking.startTime)} –{" "}
                        {formatTime(booking.endTime)}
                      </span>
                    </td>

                    <td>{booking.attendees}</td>

                    <td>
                      <div className="approval-actions">
                        <button
                          type="button"
                          className="approve-button"
                          onClick={() =>
                            setSelectedBooking({
                              ...booking,
                              decision: "APPROVED",
                            })
                          }
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className="reject-button"
                          onClick={() =>
                            setSelectedBooking({
                              ...booking,
                              decision: "REJECTED",
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
            <p>No pending requests are assigned to you.</p>
          </div>
        ))}

      </section>

      <Footer />

      {selectedBooking && (
        <div
          className="approval-dialog-backdrop"
          onClick={() => { if (!saving) { setSelectedBooking(null); setRejectionReason(""); } }}
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
              {selectedBooking.decision === "REJECTED"
                ? "Reject this request?"
                : "Approve this request?"}
            </h2>

            <p id="approval-dialog-description">
              You are about to{" "}
              <strong>
                {selectedBooking.decision === "REJECTED" ? "reject" : "approve"}
              </strong>{" "}
              the booking for <strong>{selectedBooking.venue}</strong>,
              requested by <strong>{selectedBooking.requester}</strong> on{" "}
              <strong>{formatDate(selectedBooking.date)}</strong>.
            </p>

            {error && <p role="alert">{error}</p>}
            {selectedBooking.decision === "REJECTED" && (
              <label className="form-field">Reason (optional)
                <textarea value={rejectionReason} onChange={event => setRejectionReason(event.target.value)} disabled={saving} />
              </label>
            )}
            <div className="approval-dialog-actions">
              <button
                type="button"
                className="dialog-cancel-button"
                onClick={() => { if (!saving) { setSelectedBooking(null); setRejectionReason(""); } }}
              >
                Go back
              </button>

              <button
                type="button"
                className={
                  selectedBooking.decision === "REJECTED"
                    ? "dialog-reject-button"
                    : "dialog-confirm-button"
                }
                disabled={saving}
                onClick={() =>
                  handleDecision(
                    selectedBooking.id,
                    selectedBooking.decision
                  )
                }
              >
                {saving ? "Saving..." : selectedBooking.decision === "REJECTED"
                  ? "Confirm rejection"
                  : "Confirm approval"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default ApprovalsPage;
