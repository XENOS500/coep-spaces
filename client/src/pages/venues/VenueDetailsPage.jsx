
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import Footer from '../../components/layout/Footer.jsx'
import { fetchVenue } from '../../services/venueApi.js'
import { createBooking, checkAvailability as fetchAvailability } from '../../services/bookingApi.js'
import { useAuth } from '../../services/authContext.js'
import { campusTimestamp, campusToday } from '../../services/dates.js'

function VenueDetailsPage() {
  const { id } = useParams()
  const [venue, setVenue] = useState(null)
  const [venueLoading, setVenueLoading] = useState(true)
  const [venueError, setVenueError] = useState('')

  const [eventName, setEventName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [attendees, setAttendees] = useState('1')
  const [purpose, setPurpose] = useState('')
  const [contact, setContact] = useState('')
  const [availability, setAvailability] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadVenue() {
      try {
        setVenueLoading(true)
        setVenueError('')
        setVenue(null)
        setAvailability('')
        setStatus('')
        setError('')
        const result = await fetchVenue(id, controller.signal)
        if (!controller.signal.aborted) setVenue(result)
      } catch (err) {
        if (!controller.signal.aborted) setVenueError(err.message)
      } finally {
        if (!controller.signal.aborted) setVenueLoading(false)
      }
    }

    loadVenue()
    return () => controller.abort()
  }, [id])

  const { user } = useAuth()
  const canBook = user?.role === 'REQUESTER'
  const currentSlot = JSON.stringify([id, bookingDate, startTime, endTime])
  const slotAvailable = availability?.slot === currentSlot && availability.available

  function times() {
    if (!bookingDate || !startTime || !endTime) throw new Error('Choose a date, start time and end time.')
    const start = campusTimestamp(bookingDate, startTime)
    const end = campusTimestamp(bookingDate, endTime)
    if (new Date(start) <= new Date()) throw new Error('Choose a future start time.')
    if (start >= end) throw new Error('End time must be later than start time.')
    return { start, end }
  }

  async function checkAvailability() {
    if (checking) return
    setError('')
    setAvailability(null)
    setChecking(true)
    try {
      const { start, end } = times()
      const result = await fetchAvailability(id, start, end)
      setAvailability({ slot: currentSlot, available: result.available })
    } catch (err) { setError(err.message) }
    finally { setChecking(false) }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      const { start, end } = times()
      await createBooking({
        venueId: id, eventName: eventName.trim(), purpose: purpose.trim(),
        contactInfo: contact.trim(), studCount: Number(attendees), startTime: start, endTime: end,
      })
      setStatus('pending')
    } catch (err) { setAvailability(null); setError(err.message) }
    finally { setSubmitting(false) }
  }

  if (venueLoading || venueError) {
    return (
      <main className="venue-detail-page">

        <section className="venue-not-found" aria-live="polite">
          {venueLoading ? <p>Loading venue...</p> : (
            <>
              <p role="alert">{venueError}</p>
              <Link className="booking-primary-link" to="/venues">
                Return to venues
              </Link>
            </>
          )}
        </section>
        <Footer />
      </main>
    )
  }

  if (!venue) {
    return (
      <main className="venue-detail-page">

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


      <div className="venue-detail-container">
        <Link to="/venues" className="back-to-venues">
          ← All venues
        </Link>

        <section className="venue-detail-hero">
          <div className="venue-detail-image-wrap">
            {venue.image ? <img
              src={venue.image}
              alt={venue.name}
            /> : <div className="venue-photo-placeholder venue-detail-photo-placeholder" aria-label="No venue photo available">Photo not added</div>}
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
                  <div className="form-field booking-full-width">
                    <label htmlFor="eventName">Event name</label>
                    <input id="eventName" value={eventName} onChange={event => setEventName(event.target.value)} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="bookingDate">Booking date</label>
                    <input
                      id="bookingDate"
                      type="date"
                      min={campusToday()}
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
                      maxLength={300}
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
                      {slotAvailable ? 'This slot is currently available.' : availability?.slot === currentSlot && availability.available === false ? 'This slot is already reserved. Choose another time.' : 'Choose a date and time, then check your slot.'}
                    </p>
                  </div>

                  <button
                    className="booking-secondary-button"
                    type="button"
                    onClick={checkAvailability}
                    disabled={checking || submitting}
                  >
                    {checking ? 'Checking...' : 'Check availability'}
                  </button>
                </div>

                {slotAvailable && (
                  <p className="availability-success">
                    Available now. Availability is checked again when you submit.
                  </p>
                )}

                <button className="auth-submit" type="submit" disabled={submitting || checking}>
                  {submitting ? 'Submitting...' : 'Submit booking request'}
                </button>
              </form>
            )}
          </section>
        )}

        {!canBook && (
          <p className="role-notice">
            Booking requests are available to requester accounts.
          </p>
        )}

        {status === 'pending' && (
          <section className="booking-success">
            <p className="eyebrow">REQUEST SAVED</p>
            <h2>Your request is pending.</h2>
            <p>
              Your request has been saved. Track its status in My Bookings.
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
