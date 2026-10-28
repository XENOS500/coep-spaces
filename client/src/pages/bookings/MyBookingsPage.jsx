
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'
import { getBookings } from '../../data/demoStore.js'

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
  const [bookings, setBookings] = useState(() => getBookings())
  const [selectedFilter, setSelectedFilter] = useState('ALL')

  useEffect(() => {
    function refreshBookings() {
      setBookings(getBookings())
    }

    window.addEventListener('focus', refreshBookings)
    window.addEventListener('pageshow', refreshBookings)
    window.addEventListener('coep-demo-data-changed', refreshBookings)
    window.addEventListener('storage', refreshBookings)

    return () => {
      window.removeEventListener('focus', refreshBookings)
      window.removeEventListener('pageshow', refreshBookings)
      window.removeEventListener('coep-demo-data-changed', refreshBookings)
      window.removeEventListener('storage', refreshBookings)
    }
  }, [])

  // Filter by the demo Booker identity when one is set.
  const currentEmail = sessionStorage.getItem('demoBookerEmail')
  const myBookings = currentEmail
    ? bookings.filter((booking) => booking.email === currentEmail)
    : bookings

  const filteredBookings = myBookings.filter((booking) => {
    return selectedFilter === 'ALL' || booking.status === selectedFilter
  })

  const pendingCount = myBookings.filter(
    (booking) => booking.status === 'PENDING'
  ).length

  const approvedCount = myBookings.filter(
    (booking) => booking.status === 'APPROVED'
  ).length

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
            <strong>{myBookings.length}</strong>
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
              <h3>
                {myBookings.length === 0
                  ? 'No bookings yet'
                  : `No ${selectedFilter.toLowerCase()} bookings`}
              </h3>
              <p>
                Explore campus venues to find a space for your next event.
              </p>
              <Link to="/venues" className="booking-primary-link">
                Browse venues
              </Link>
            </div>
          )}
        </div>

        <p className="demo-data-note">
          Demo mode: bookings are read from browser storage. Real
          accounts and server persistence require backend integration.
        </p>
      </section>

      <Footer />
    </main>
  )
}

export default MyBookingsPage
