
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'
import { fetchMyBookings, cancelBooking } from '../../services/bookingApi.js'
import { formatDate, formatTime } from '../../services/dates.js'

const filters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('ALL')

  useEffect(() => {
    const controller = new AbortController()
    async function refreshBookings() {
      try {
        setError('')
        const result = await fetchMyBookings(controller.signal)
        if (!controller.signal.aborted) setBookings(result)
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    refreshBookings()
    window.addEventListener('focus', refreshBookings)
    return () => { controller.abort(); window.removeEventListener('focus', refreshBookings) }
  }, [])

  async function handleCancel(id) {
    if (cancelling) return
    setCancelling(id)
    setError('')
    try {
      const updated = await cancelBooking(id)
      setBookings(current => current.map(booking => booking.id === id ? updated : booking))
    } catch (err) { setError(err.message) }
    finally { setCancelling('') }
  }
  const myBookings = bookings

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
          {error && <p role="alert">{error}</p>}
          {loading && <p role="status">Loading bookings...</p>}
          {!loading && !error && (filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <article className="my-booking-card" key={booking.id}>
                <div className="my-booking-main">
                  <div className="my-booking-title-row">
                    <div>
                      <p className="booking-reference">{booking.id}</p>
                      <h3>{booking.venue}</h3>
                      <p>{booking.eventName}</p>
                    </div>

                    <span
                      className={`booking-status status-${booking.status.toLowerCase()}`}
                    >
                      {booking.status.charAt(0) +
                        booking.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {['PENDING', 'APPROVED'].includes(booking.status) && new Date(booking.startTime) > new Date() && (
                    <button className="booking-secondary-button" type="button" disabled={Boolean(cancelling)} onClick={() => handleCancel(booking.id)}>
                      {cancelling === booking.id ? 'Cancelling...' : 'Cancel booking'}
                    </button>
                  )}
                  {booking.rejectionReason && <p>Reason: {booking.rejectionReason}</p>}
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
          ))}
        </div>

      </section>

      <Footer />
    </main>
  )
}

export default MyBookingsPage
