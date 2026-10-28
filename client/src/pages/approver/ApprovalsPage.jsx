
import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar.jsx";
import Footer from "../../components/layout/Footer.jsx";
import {
  getVenues,
  getBookings,
  saveBookings,
  DEMO_APPROVERS,
} from "../../data/demoStore.js";

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function ApprovalsPage() {
  const [venues, setVenues] = useState(() => getVenues());
  const [bookings, setBookings] = useState(() => getBookings());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState("");

  const [currentApprover, setCurrentApprover] = useState(() => {
    const savedApprover = sessionStorage.getItem("demoApproverName");

    return DEMO_APPROVERS.includes(savedApprover)
      ? savedApprover
      : DEMO_APPROVERS[0];
  });

  // Refresh shared data when another page changes venues or bookings.
  useEffect(() => {
    function refreshData() {
      setVenues(getVenues());
      setBookings(getBookings());
    }

    window.addEventListener("focus", refreshData);
    window.addEventListener("pageshow", refreshData);
    window.addEventListener("coep-demo-data-changed", refreshData);

    // The storage event also handles changes made in another browser tab.
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("pageshow", refreshData);
      window.removeEventListener("coep-demo-data-changed", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  // Only show pending bookings for venues assigned to this Approver.
  const pendingBookings = bookings.filter((booking) => {
    if (booking.status !== "PENDING") return false;

    const venue = venues.find(
      (item) =>
        item.id === booking.venueId ||
        (!booking.venueId && item.name === booking.venue)
    );

    return venue && venue.approver === currentApprover;
  });

  function handleApproverChange(event) {
    const approver = event.target.value;

    setCurrentApprover(approver);
    sessionStorage.setItem("demoApproverName", approver);
    setMessage("");
  }

  function handleDecision(bookingId, decision) {
    const booking = bookings.find((item) => item.id === bookingId);

    if (!booking || booking.status !== "PENDING") {
      setSelectedBooking(null);
      setMessage("This booking has already been decided.");
      return;
    }

    const venue = venues.find(
      (item) =>
        item.id === booking.venueId ||
        (!booking.venueId && item.name === booking.venue)
    );

    // Check the assignment again before applying the demo decision.
    if (!venue || venue.approver !== currentApprover) {
      setSelectedBooking(null);
      setMessage("This booking is not assigned to the selected Approver.");
      return;
    }

    const updatedBookings = bookings.map((item) =>
      item.id === bookingId
        ? { ...item, status: decision }
        : item
    );

    try {
      saveBookings(updatedBookings);
      setBookings(updatedBookings);
      setMessage(`Booking ${bookingId} marked ${decision.toLowerCase()}.`);
      setSelectedBooking(null);

      window.dispatchEvent(new Event("coep-demo-data-changed"));
    } catch {
      setMessage("Could not save this decision in the browser. Please retry.");
    }
  }

  return (
    <main className="approvals-page">
      <Navbar />

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
            <p>Requests assigned to the selected demo Approver.</p>
          </div>

          <div className="pending-count">
            <strong>{pendingBookings.length}</strong>
            <span>AWAITING REVIEW</span>
          </div>
        </div>

        <div className="form-field approval-approver-selector">
          <label htmlFor="demo-approver">Test as Approver</label>
          <select
            id="demo-approver"
            value={currentApprover}
            onChange={handleApproverChange}
          >
            {DEMO_APPROVERS.map((approver) => (
              <option key={approver} value={approver}>
                {approver}
              </option>
            ))}
          </select>
          <span className="table-secondary">
            Demo selector only. A real Approver identity must come from
            backend authentication.
          </span>
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
                      <span className="table-secondary">{booking.email}</span>
                      <span className="table-reference">{booking.id}</span>
                    </td>

                    <td>
                      <strong>{booking.venue}</strong>
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
            <p>No pending requests are assigned to {currentApprover}.</p>
          </div>
        )}

        <p className="approval-demo-note">
          Demo mode: decisions are saved in this browser only. Real
          authentication, server persistence and authorization require the
          backend API.
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
                  selectedBooking.decision === "REJECTED"
                    ? "dialog-reject-button"
                    : "dialog-confirm-button"
                }
                onClick={() =>
                  handleDecision(
                    selectedBooking.id,
                    selectedBooking.decision
                  )
                }
              >
                {selectedBooking.decision === "REJECTED"
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
