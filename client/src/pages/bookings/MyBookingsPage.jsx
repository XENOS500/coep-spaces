
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'

// Temporary data until the booking API is ready.
const demoBookings = [
  {
    id: 'BK-1024',
    venue: 'Main Auditorium',
    date: '2026-11-05',
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'Technical workshop',
    attendees: 120,
    status: 'PENDING',
  },
  {
    id: 'BK-1018',
    venue: 'Seminar Hall 1',
    date: '2026-11-02',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Student club meeting',
    attendees: 45,
    status: 'APPROVED',
  },
  {
    id: 'BK-1009',
    venue: 'Classroom B204',
    date: '2026-10-20',
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Project discussion',
    attendees: 25,
    status: 'REJECTED',
  },
]

const filters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

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

function MyBookingsPage() {
  const [selectedFilter, setSelectedFilter] = useState('ALL')

  const filteredBookings = demoBookings.filter((booking) => {
    return (
      selectedFilter === 'ALL' || booking.status === selectedFilter
    )
  })

  return (
    <main className="my-bookings-page">
      <Navbar />

      <section className="bookings-heading">
        <p className="eyebrow">COEP / YOUR ACTIVITY</p>
        <h1>My <span>bookings.</span></h1>
        <p>
          Keep track of your venue requests, upcoming events and
          approval decisions in one place.
        </p>
      </section>

      <section className="bookings-content">
        <div className="booking-summary">
          <div>
            <span>TOTAL REQUESTS</span>
            <strong>{demoBookings.length}</strong>
          </div>
          <div>
            <span>AWAITING DECISION</span>
            <strong>
              {demoBookings.filter((b) => b.status === 'PENDING').length}
            </strong>
          </div>
          <div>
            <span>APPROVED</span>
            <strong>
              {demoBookings.filter((b) => b.status === 'APPROVED').length}
            </strong>
          </div>
        </div>

        <div className="bookings-list-heading">
          <h2>Booking requests</h2>
          <Link to="/venues" className="booking-primary-link">
            Explore venues
          </Link>
        </div>

        <div className="booking-filters" aria-label="Filter bookings">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={
                selectedFilter === filter
                  ? 'booking-filter active'
                  : 'booking-filter'
              }
              onClick={() => setSelectedFilter(filter)}
              aria-pressed={selectedFilter === filter}
            >
              {filter === 'ALL'
                ? 'All requests'
                : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="my-bookings-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <article className="my-booking-card" key={booking.id}>
                <div className="my-booking-main">
                  <div className="my-booking-title-row">
                    <div>
                      <p className="booking-reference">{booking.id}</p>
                      <h3>{booking.venue}</h3>
                    </div>

                    <span
                      className={`booking-status status-${booking.status.toLowerCase()}`}
                    >
                      {booking.status.charAt(0) +
                        booking.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <p className="my-booking-purpose">{booking.purpose}</p>

                  <div className="my-booking-details">
                    <span>
                      <strong>Date</strong>
                      {formatDate(booking.date)}
                    </span>
                    <span>
                      <strong>Time</strong>
                      {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                    </span>
                    <span>
                      <strong>Attendees</strong>
                      {booking.attendees}
                    </span>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="bookings-empty">
              <h3>No {selectedFilter.toLowerCase()} bookings</h3>
              <p>
                Try another status filter or explore campus venues
                to start a request.
              </p>
              <Link to="/venues" className="booking-primary-link">
                Browse venues
              </Link>
            </div>
          )}
        </div>

        <p className="demo-data-note">
          Demonstration data only. Your actual requests will appear
          here once the booking API is connected.
        </p>
      </section>

      <Footer />
    </main>
  )
}

export default MyBookingsPage
