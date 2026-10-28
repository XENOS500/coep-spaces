
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/layout/Navbar.jsx'
import Footer from '../../components/layout/Footer.jsx'
import { getVenues, getBookings, saveBookings, dispatchStoreEvent } from '../../data/demoStore.js'

function VenueDetailsPage() {
  const { id } = useParams()

  const venues = getVenues()
  const venue = venues.find((v) => v.id === id)

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

  function checkAvailability() {
    setError('')
    setAvailability('')

    if (!bookingDate || !startTime || !endTime) {
      setError('Choose a date, start time and end time first.')
      return
    }

    if (startTime >= endTime) {
      setError('End time must be later than start time.')
      return
    }

    if (new Date(`${bookingDate}T00:00:00`) < new Date(new Date().toDateString())) {
      setError('Choose today or a future date.')
      return
    }

    // Demo only: this does not query the real booking database.
    setAvailability('demo-available')
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!availability) {
      setError('Check availability before submitting your request.')
      return
    }

    if (Number(attendees) < 1 || Number(attendees) > venue.capacity) {
      setError(`Attendees must be between 1 and ${venue.capacity}.`)
      return
    }

    if (!purpose.trim() || !contact.trim()) {
      setError('Enter the event purpose and contact information.')
      return
    }

    const newBooking = {
      id: `BK-${Date.now()}`,
      requester: sessionStorage.getItem('demoBookerName') || 'Demo Booker',
      email: sessionStorage.getItem('demoBookerEmail') || 'booker@demo.com',
      venueId: venue.id,
      venue: venue.name,
      date: bookingDate,
      startTime,
      endTime,
      attendees: Number(attendees),
      purpose,
      status: 'PENDING',
    }

    const updated = [...getBookings(), newBooking]
    saveBookings(updated)
    dispatchStoreEvent()
    setStatus('pending')
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
              src={venue.image || 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80'}
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

        {venue.facilities && venue.facilities.length > 0 && (
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
                Availability is checked for your selected date and time.
                Requests remain pending until approved.
              </p>
            </div>

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
                    value={attendees}
                    onChange={(event) => setAttendees(event.target.value)}
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
                  Demo availability check passed. Real availability
                  requires the backend service.
                </p>
              )}

              <button className="auth-submit" type="submit">
                Submit booking request
              </button>
            </form>
          </section>
        )}

        {!canBook && (
          <p className="role-notice">
            Booking requests are available to requester accounts.
          </p>
        )}

        {status === 'pending' && (
          <section className="booking-success">
            <p className="eyebrow">REQUEST PREPARED</p>
            <h2>Your request is marked pending.</h2>
            <p>
              This is a frontend demonstration. No booking has been saved
              to the backend yet.
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
