
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/layout/Footer.jsx";
import {
  getBookings,
  dispatchStoreEvent,
} from "../../data/demoStore.js";

function MyBookingsPage() {
  const [bookings, setBookings] = useState(() => getBookings());
  const [activeFilter, setActiveFilter] = useState("ALL");

  useEffect(() => {
    function refreshBookings() {
      setBookings(getBookings());
    }

    window.addEventListener("storage", refreshBookings);
    window.addEventListener("demoStoreUpdate", refreshBookings);

    return () => {
      window.removeEventListener("storage", refreshBookings);
      window.removeEventListener("demoStoreUpdate", refreshBookings);
    };
  }, []);

  const visibleBookings = useMemo(() => {
    if (activeFilter === "ALL") return bookings;

    return bookings.filter(
      (booking) => booking.status?.toUpperCase() === activeFilter
    );
  }, [bookings, activeFilter]);

  const pendingCount = bookings.filter(
    (booking) => booking.status?.toUpperCase() === "PENDING"
  ).length;

  const approvedCount = bookings.filter(
    (booking) => booking.status?.toUpperCase() === "APPROVED"
  ).length;

  const filters = [
    { label: "All requests", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  function formatDate(date) {
    if (!date) return "Not specified";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatStatus(status) {
    if (!status) return "Pending";

    return status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase();
  }

  return (
    <main className="my-bookings-page">
      <section className="bookings-heading">
        <p className="eyebrow">COEP / YOUR ACTIVITY</p>

        <h1>
          My <span>bookings.</span>
        </h1>

        <p>
          Keep track of your venue requests, upcoming events and
          approval decisions in one place.
        </p>
      </section>

      <section className="bookings-content">
        <div className="booking-summary">
          <div>
            <span>TOTAL REQUESTS</span>
            <strong>{bookings.length}</strong>
          </div>

          <div>
            <span>AWAITING DECISION</span>
            <strong>{pendingCount}</strong>
          </div>

          <div>
            <span>APPROVED</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>

        <div className="bookings-list-heading">
          <h2>Booking requests</h2>

          <Link className="booking-primary-link" to="/venues">
            Explore venues
          </Link>
        </div>

        <div className="booking-filters" aria-label="Filter bookings">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`booking-filter ${
                activeFilter === filter.value ? "active" : ""
              }`}
              aria-pressed={activeFilter === filter.value}
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="my-bookings-list">
          {visibleBookings.length > 0 ? (
            visibleBookings.map((booking) => {
              const status = booking.status?.toUpperCase() || "PENDING";
              const venueName =
                booking.venue || booking.venueName || "Venue request";

              return (
                <article
                  className="my-booking-card"
                  key={booking.id}
                >
                  <div className="my-booking-main">
                    <div className="my-booking-title-row">
                      <div>
                        <p className="booking-reference">
                          REQUEST · {booking.id || "N/A"}
                        </p>

                        <h3>{venueName}</h3>
                      </div>

                      <span
                        className={`booking-status status-${status.toLowerCase()}`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>

                    <p className="my-booking-purpose">
                      {booking.purpose || "No purpose provided"}
                    </p>

                    <div className="my-booking-details">
                      <span>
                        <strong>DATE</strong>
                        {formatDate(booking.date)}
                      </span>

                      <span>
                        <strong>TIME</strong>
                        {booking.startTime && booking.endTime
                          ? `${booking.startTime} – ${booking.endTime}`
                          : "Not specified"}
                      </span>

                      <span>
                        <strong>ATTENDEES</strong>
                        {booking.attendees ?? "Not specified"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="bookings-empty">
              <p>
                {bookings.length === 0
                  ? "You haven't submitted any booking requests yet."
                  : "No requests match this filter."}
              </p>

              <Link className="booking-primary-link" to="/venues">
                Browse venues
              </Link>
            </div>
          )}
        </div>

        <p className="demo-data-note">
          Booking information is displayed using the data source
          configured for this project.
        </p>
      </section>

      <Footer />
    </main>
  );
}

export default MyBookingsPage;
