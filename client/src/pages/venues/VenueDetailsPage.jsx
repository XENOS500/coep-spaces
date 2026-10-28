
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'
import {
  getVenues,
  getBookings,
  saveBookings,
  dispatchStoreEvent,
} from '../../data/demoStore.js'

function VenueDetailsPage() {
  const { id } = useParams()
  const venue = getVenues().find((item) => item.id === id)

  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [attendees, setAttendees] = useState('1')
  const [purpose, setPurpose] = useState('')
  const [contact, setContact] = useState('')
  const [availability, setAvailability] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const role = sessionStorage.getItem('demoRole') || 'BOOKER'
  const canBook = role === 'BOOKER' || role === 'REQUESTER'

  function checkAvailability() {
    setError('')
    setAvailability('')

    if (!bookingDate || !startTime || !endTime) {
      setError('Choose a date, start time and end time first.')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const selectedDate = new Date(`${bookingDate}T00:00:00`)

    if (selectedDate < today) {
      setError('Choose today or a future date.')
      return
    }

    if (startTime >= endTime) {
      setError('End time must be later than start time.')
      return
    }

    const currentBookings = getBookings()

    const hasConflict = currentBookings.some((booking) => {
      const sameVenue =
        booking.venueId === venue.id ||
        (!booking.venueId && booking.venue === venue.name)

      const sameDate = booking.date === bookingDate
      const stillReserved =
        booking.status === 'PENDING' || booking.status === 'APPROVED'

      const overlaps =
        startTime < booking.endTime && endTime > booking.startTime

      return sameVenue && sameDate && stillReserved && overlaps
    })

    if (hasConflict) {
      setError(
        'This time overlaps an existing pending or approved demo booking. Try another slot.'
      )
      return
    }

    // Frontend demo check only; the backend must perform the real check.
    setAvailability('demo-available')
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!venue.active && venue.active !== undefined) {
      setError('This venue is inactive and cannot be booked.')
      return
    }

    if (availability !== 'demo-available') {
      setError('Check availability before submitting your request.')
      return
    }

    const attendeeCount = Number(attendees)

    if (
      !Number.isInteger(attendeeCount) ||
      attendeeCount < 1 ||
      attendeeCount > Number(venue.capacity)
    ) {
      setError(`Attendees must be a whole number between 1 and ${venue.capacity}.`)
      return
    }

    if (!purpose.trim() || !contact.trim()) {
      setError('Enter the event purpose and contact information.')
      return
    }

    const currentBookings = getBookings()

    // Recheck to avoid using an outdated availability result.
    const hasConflict = currentBookings.some((booking) => {
      const sameVenue =
        booking.venueId === venue.id ||
        (!booking.venueId && booking.venue === venue.name)

      return (
        sameVenue &&
        booking.date === bookingDate &&
        (booking.status === 'PENDING' || booking.status === 'APPROVED') &&
        startTime < booking.endTime &&
        endTime > booking.startTime
      )
    })

    if (hasConflict) {
      setAvailability('')
      setError('This time slot is no longer available in the demo data.')
      return
    }

    const newBooking = {
      id: `BK-${Date.now()}`,
      requester: sessionStorage.getItem('demoBookerName') || 'Demo Booker',
      email: sessionStorage.getItem('demoBookerEmail') || 'booker@demo.com',
      contact: contact.trim(),
      venueId: venue.id,
      venue: venue.name,
      date: bookingDate,
      startTime,
      endTime,
      attendees: attendeeCount,
      purpose: purpose.trim(),
      status: 'PENDING',
    }

    try {
      saveBookings([...currentBookings, newBooking])
      dispatchStoreEvent()
      setStatus('pending')
    } catch {
      setError('Could not save the demo booking in this browser. Please try again.')
    }
  }

  if (!venue) {
    return (
      <main className="venue-detail-page">
        <Navbar />
        <section className="venue-not-found">
          <p className="eyebrow">VENUE DIRECTORY</p>
          <h1>We couldn't find that space.</h1>
          <p>The venue may not exist or may no longer be listed.</p>
          <Link className="booking-primary-link" to="/venues">
            Return to venues
          </Link>
        </section>
        <Footer />
      </main>
    )
  }

  return (
    <main className="venue-detail-page">
      <Navbar />

      <div className="venue-detail-container">
        <Link to="/venues" className="back-to-venues">
          ← All venues
        </Link>

        <section className="venue-detail-hero">
          <div className="venue-detail-image-wrap">
            <img
              src={
                venue.image ||
                'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80'
              }
              alt={venue.name}
            />
            <span className="venue-type-label">{venue.type}</span>
          </div>

          <div className="venue-detail-intro">
            <p className="eyebrow">COEP / CAMPUS SPACE</p>
            <h1>{venue.name}</h1>
            <p className="venue-detail-location">
              {venue.building}
              {venue.floor ? ` · ${venue.floor}` : ''}
              {venue.room ? ` · Room ${venue.room}` : ''}
            </p>
            <p className="venue-detail-description">
              Review the venue's facilities and capacity, check your
              preferred time slot, and submit a booking request.
            </p>

            <div className="venue-capacity">
              <span className="capacity-number">{venue.capacity}</span>
              <span>Maximum attendees</span>
            </div>
          </div>
        </section>

        <section className="venue-facts">
          <div>
            <span>VENUE TYPE</span>
            <strong>{venue.type}</strong>
          </div>
          <div>
            <span>BUILDING</span>
            <strong>{venue.building}</strong>
          </div>
          {venue.floor && (
            <div>
              <span>FLOOR</span>
              <strong>{venue.floor}</strong>
            </div>
          )}
          {venue.room && (
            <div>
              <span>ROOM</span>
              <strong>{venue.room}</strong>
            </div>
          )}
        </section>

        {venue.facilities?.length > 0 && (
          <section className="venue-facilities-section">
            <p className="eyebrow">WHAT'S INCLUDED</p>
            <h2>Facilities</h2>
            <div className="venue-detail-facilities">
              {venue.facilities.map((facility) => (
                <span key={facility}>{facility}</span>
              ))}
            </div>
          </section>
        )}

        {canBook && !status && (
          <section className="booking-section">
            <div className="booking-section-heading">
              <p className="eyebrow">MAKE A REQUEST</p>
              <h2>Plan your booking</h2>
              <p>
                Check your preferred time slot. Requests remain pending
                until an assigned Approver decides on them.
              </p>
            </div>

            {venue.active === false ? (
              <p className="role-notice">
                This venue is inactive and is not accepting new bookings.
              </p>
            ) : (
              <form className="booking-form" onSubmit={handleSubmit}>
                <div className="booking-form-grid">
                  <div className="form-field">
                    <label htmlFor="bookingDate">Booking date</label>
                    <input
                      id="bookingDate"
                      type="date"
                      min={new Date().toLocaleDateString('en-CA')}
                      value={bookingDate}
                      onChange={(event) => {
                        setBookingDate(event.target.value)
                        setAvailability('')
                        setError('')
                      }}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="attendees">Number of attendees</label>
                    <input
                      id="attendees"
                      type="number"
                      min="1"
                      max={venue.capacity}
                      step="1"
                      value={attendees}
                      onChange={(event) => {
                        setAttendees(event.target.value)
                        setAvailability('')
                      }}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="startTime">Start time</label>
                    <input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(event) => {
                        setStartTime(event.target.value)
                        setAvailability('')
                      }}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="endTime">End time</label>
                    <input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(event) => {
                        setEndTime(event.target.value)
                        setAvailability('')
                      }}
                      required
                    />
                  </div>

                  <div className="form-field booking-full-width">
                    <label htmlFor="purpose">Purpose of booking</label>
                    <textarea
                      id="purpose"
                      rows="3"
                      placeholder="e.g. Technical workshop, seminar or club event"
                      value={purpose}
                      onChange={(event) => setPurpose(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field booking-full-width">
                    <label htmlFor="contact">Contact information</label>
                    <input
                      id="contact"
                      type="text"
                      placeholder="Phone number or college email"
                      value={contact}
                      onChange={(event) => setContact(event.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="auth-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="availability-panel">
                  <div>
                    <h3>Availability</h3>
                    <p>
                      {availability === 'demo-available'
                        ? 'Demo result: this slot is marked available.'
                        : 'Choose a date and time, then check your slot.'}
                    </p>
                  </div>

                  <button
                    className="booking-secondary-button"
                    type="button"
                    onClick={checkAvailability}
                  >
                    Check availability
                  </button>
                </div>

                {availability === 'demo-available' && (
                  <p className="availability-success">
                    Demo check passed. Real availability requires the backend.
                  </p>
                )}

                <button className="auth-submit" type="submit">
                  Submit booking request
                </button>
              </form>
            )}
          </section>
        )}

        {!canBook && (
          <p className="role-notice">
            Booking requests are available to Booker accounts.
          </p>
        )}

        {status === 'pending' && (
          <section className="booking-success">
            <p className="eyebrow">REQUEST SAVED</p>
            <h2>Your request is pending.</h2>
            <p>
              Your request has been added to the browser's demo booking store.
              It has not been sent to a backend server.
            </p>
            <span className="status-pending">Pending</span>
            <Link className="booking-primary-link" to="/my-bookings">
              My bookings
            </Link>
          </section>
        )}
      </div>

      <Footer />
    </main>
  )
}

export default VenueDetailsPage
