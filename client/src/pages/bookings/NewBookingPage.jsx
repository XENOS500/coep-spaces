import React, { useState, useMemo } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const EVENT_TYPES = [
  'Academic Lecture / Instruction',
  'Technical Workshop / Lab Session',
  'Guest Lecture / Expert Talk',
  'Departmental Meeting / Hearing',
  'Student Society / Cultural Rehearsal',
  'Conference / Symposium Session',
  'Written Examination / Test',
  'Other'
]

export default function NewBookingPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { venues, createBooking, checkConflicts, user, isAuthenticated } = useAuth()

  // Enforce access control per PRD Section 2
  // Only REQUESTER can submit bookings.
  if (!isAuthenticated) {
    navigate(`/login?redirect=/book${id ? `/${id}` : ''}`)
    return null
  }

  if (user.role !== 'REQUESTER') {
    return (
      <div className="container page-content">
        <div className="error-panel">
          <h2>Submission Prohibited</h2>
          <p>
            Your current account role is <strong>{user.role}</strong>. Under institutional policy, only accounts with role <strong>REQUESTER</strong> may submit booking requisitions.
          </p>
          <Link to="/venues" className="btn-secondary">Return to Venue Catalog</Link>
        </div>
      </div>
    )
  }

  // Pre-fill state if transferred from AvailabilityPage
  const initialSchedule = location.state || {}

  // 30-day window boundary
  const today = new Date().toISOString().split('T')[0]
  const maxDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  }, [])

  // Form Fields
  const [selectedVenueId, setSelectedVenueId] = useState(() => {
    return id || initialSchedule.venueId || venues.find((v) => v.bookingEnabled && v.capacity !== null)?.id || venues[0]?.id
  })

  const [eventTitle, setEventTitle] = useState('')
  const [eventType, setEventType] = useState(EVENT_TYPES[0])
  const [otherEventType, setOtherEventType] = useState('')
  
  // Contact details
  const [contactName, setContactName] = useState(user.name || '')
  const [contactEmail, setContactEmail] = useState(user.email || '')
  const [contactPhone, setContactPhone] = useState('9822000000')

  const [guestCount, setGuestCount] = useState('50')
  const [eventDetails, setEventDetails] = useState('')
  const [purpose, setPurpose] = useState('')

  // Schedule Fields
  const [scheduleType, setScheduleType] = useState(initialSchedule.scheduleType || 'SINGLE')
  const [singleDate, setSingleDate] = useState(initialSchedule.singleDate || today)
  const [startDate, setStartDate] = useState(initialSchedule.startDate || today)
  const [endDate, setEndDate] = useState(initialSchedule.endDate || today)
  const [selectedWeekdays, setSelectedWeekdays] = useState(initialSchedule.selectedWeekdays || [1, 2, 3, 4, 5])
  const [startTime, setStartTime] = useState(initialSchedule.startTime || '09:00')
  const [endTime, setEndTime] = useState(initialSchedule.endTime || '11:00')

  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedVenue = venues.find((v) => v.id === selectedVenueId)

  // Compute generated occurrences in real-time
  const previewOccurrences = useMemo(() => {
    if (startTime >= endTime) return []

    const occs = []
    if (scheduleType === 'SINGLE') {
      if (singleDate >= today && singleDate <= maxDate) {
        occs.push({ date: singleDate, startsAt: startTime, endsAt: endTime })
      }
    } else {
      if (startDate <= endDate && startDate >= today && endDate <= maxDate) {
        const curr = new Date(`${startDate}T00:00:00`)
        const end = new Date(`${endDate}T00:00:00`)
        while (curr <= end) {
          const dayOfWeek = curr.getDay() === 0 ? 7 : curr.getDay()
          if (selectedWeekdays.includes(dayOfWeek)) {
            occs.push({
              date: curr.toISOString().split('T')[0],
              startsAt: startTime,
              endsAt: endTime
            })
          }
          curr.setDate(curr.getDate() + 1)
        }
      }
    }
    return occs
  }, [scheduleType, singleDate, startDate, endDate, selectedWeekdays, startTime, endTime, today, maxDate])

  // Check conflicts in real-time
  const conflicts = useMemo(() => {
    if (!selectedVenue || previewOccurrences.length === 0) return []
    return checkConflicts(selectedVenue.id, previewOccurrences)
  }, [selectedVenue, previewOccurrences, checkConflicts])

  const toggleWeekday = (dayNum) => {
    if (selectedWeekdays.includes(dayNum)) {
      if (selectedWeekdays.length === 1) return
      setSelectedWeekdays(selectedWeekdays.filter((d) => d !== dayNum))
    } else {
      setSelectedWeekdays([...selectedWeekdays, dayNum].sort())
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')

    if (!selectedVenue) {
      setFormError('Please select a facility.')
      return
    }

    if (!selectedVenue.bookingEnabled || selectedVenue.capacity === null) {
      setFormError('This facility is currently not enabled for reservation submissions.')
      return
    }

    const parsedCount = parseInt(guestCount, 10)
    if (!parsedCount || parsedCount <= 0) {
      setFormError('Guest count must be a positive integer.')
      return
    }

    if (parsedCount > selectedVenue.capacity) {
      setFormError(`Guest count (${parsedCount}) exceeds the verified facility capacity (${selectedVenue.capacity}).`)
      return
    }

    if (previewOccurrences.length === 0) {
      setFormError('No valid occurrences generated. Ensure dates fall within the 30-day advance booking window.')
      return
    }

    if (conflicts.length > 0) {
      setFormError(`Slot conflict exists on ${conflicts[0].date}. Requisition cannot be submitted with overlapping holds.`)
      return
    }

    setIsSubmitting(true)

    try {
      const finalEventType = eventType === 'Other' ? `Other: ${otherEventType}` : eventType

      const newBooking = createBooking({
        venueId: selectedVenue.id,
        eventTitle: eventTitle.trim(),
        eventType: finalEventType,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        guestCount: parsedCount,
        details: eventDetails.trim(),
        purpose: purpose.trim(),
        startDate: scheduleType === 'SINGLE' ? singleDate : startDate,
        endDate: scheduleType === 'SINGLE' ? singleDate : endDate,
        weekdays: scheduleType === 'SINGLE' ? [] : selectedWeekdays,
        localStartTime: startTime,
        localEndTime: endTime,
        occurrences: previewOccurrences.map((o, idx) => ({
          id: `occ-${Date.now()}-${idx}`,
          date: o.date,
          startsAt: o.startsAt,
          endsAt: o.endsAt,
          status: 'PENDING'
        }))
      })

      navigate('/my-bookings', { state: { submittedBookingId: newBooking.id } })
    } catch (err) {
      setFormError(err.message)
      setIsSubmitting(false)
    }
  }

  const weekdayNames = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
    { num: 6, label: 'Sat' },
    { num: 7, label: 'Sun' }
  ]

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <Link to="/venues">Venue Catalog</Link>
            <span className="sep">/</span>
            <span className="current">New Booking Requisition</span>
          </div>

          <h1 className="header-title">Submit Venue Requisition</h1>
          <p className="header-desc">
            Complete formal reservation requisition for institutional events. Requisitions are reviewed by the designated venue approver.
          </p>
        </div>
      </div>

      <div className="container page-content">
        {formError && (
          <div className="alert-box alert-danger" style={{ marginBottom: '24px' }}>
            <strong>Submission Validation Error:</strong> {formError}
          </div>
        )}

        <div className="booking-layout-two-col">
          {/* Main Form */}
          <div className="card-section">
            <form onSubmit={handleSubmit}>
              {/* 1. Facility Selection */}
              <h2 className="card-section-title">1. Target Campus Facility</h2>
              <div className="form-field">
                <label htmlFor="venue-select">Select Venue</label>
                <select
                  id="venue-select"
                  className="input-select"
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  required
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id} disabled={!v.bookingEnabled || v.capacity === null}>
                      {v.name} ({v.buildingName}) — {v.capacity ? `${v.capacity} seats` : 'Capacity Unverified'}
                      {!v.bookingEnabled ? ' [Disabled]' : ''}
                    </option>
                  ))}
                </select>
                {selectedVenue && (
                  <span className="form-hint">
                    Operating Hours: {selectedVenue.openingTime} to {selectedVenue.closingTime} &bull; Verified Capacity: {selectedVenue.capacity || 'None'}
                  </span>
                )}
              </div>

              {/* 2. Schedule Specification */}
              <h2 className="card-section-title" style={{ marginTop: '28px' }}>2. Schedule & Recurrence</h2>
              <div className="form-field">
                <label>Schedule Frequency</label>
                <div className="radio-button-group">
                  <label className={`radio-pill ${scheduleType === 'SINGLE' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="scheduleType"
                      checked={scheduleType === 'SINGLE'}
                      onChange={() => setScheduleType('SINGLE')}
                    />
                    Single Date Occurrence
                  </label>
                  <label className={`radio-pill ${scheduleType === 'RECURRING' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="scheduleType"
                      checked={scheduleType === 'RECURRING'}
                      onChange={() => setScheduleType('RECURRING')}
                    />
                    Recurring Series
                  </label>
                </div>
              </div>

              {scheduleType === 'SINGLE' ? (
                <div className="form-field">
                  <label htmlFor="date-input">Event Date</label>
                  <input
                    id="date-input"
                    type="date"
                    className="input-text"
                    min={today}
                    max={maxDate}
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    required
                  />
                  <span className="form-hint">Permitted advance booking horizon: {today} to {maxDate}</span>
                </div>
              ) : (
                <>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label htmlFor="series-start">Series Start Date</label>
                      <input
                        id="series-start"
                        type="date"
                        className="input-text"
                        min={today}
                        max={maxDate}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="series-end">Series End Date</label>
                      <input
                        id="series-end"
                        type="date"
                        className="input-text"
                        min={startDate}
                        max={maxDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Active Weekdays (Monday = 1)</label>
                    <div className="weekday-selector">
                      {weekdayNames.map((w) => (
                        <button
                          key={w.num}
                          type="button"
                          className={`btn-weekday ${selectedWeekdays.includes(w.num) ? 'selected' : ''}`}
                          onClick={() => toggleWeekday(w.num)}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="time-start">Daily Start Time</label>
                  <input
                    id="time-start"
                    type="time"
                    className="input-text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="time-end">Daily End Time</label>
                  <input
                    id="time-end"
                    type="time"
                    className="input-text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 3. Event Information */}
              <h2 className="card-section-title" style={{ marginTop: '28px' }}>3. Event Information</h2>
              <div className="form-field">
                <label htmlFor="event-title">Event Title</label>
                <input
                  id="event-title"
                  type="text"
                  className="input-text"
                  placeholder="e.g. National Symposium on Sustainable Materials"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="event-type">Event Type</label>
                  <select
                    id="event-type"
                    className="input-select"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    required
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="guest-count">Expected Guest / Attendee Count</label>
                  <input
                    id="guest-count"
                    type="number"
                    min="1"
                    max={selectedVenue?.capacity || 1000}
                    className="input-text"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    required
                  />
                  {selectedVenue?.capacity && (
                    <span className="form-hint">Maximum verified capacity: {selectedVenue.capacity}</span>
                  )}
                </div>
              </div>

              {eventType === 'Other' && (
                <div className="form-field">
                  <label htmlFor="other-type">Specify Event Classification</label>
                  <input
                    id="other-type"
                    type="text"
                    className="input-text"
                    placeholder="Enter custom event classification..."
                    value={otherEventType}
                    onChange={(e) => setOtherEventType(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-field">
                <label htmlFor="event-purpose">Institutional Purpose</label>
                <input
                  id="event-purpose"
                  type="text"
                  className="input-text"
                  placeholder="Brief justification for space reservation..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="event-details">Event Details & Specific Requirements</label>
                <textarea
                  id="event-details"
                  rows="3"
                  className="input-textarea"
                  placeholder="Detailed agenda, seating requirements, guest dignitary notes..."
                  value={eventDetails}
                  onChange={(e) => setEventDetails(e.target.value)}
                  required
                />
              </div>

              {/* 4. Event Contact Details */}
              <h2 className="card-section-title" style={{ marginTop: '28px' }}>4. Event Contact Details</h2>
              <div className="form-row-3">
                <div className="form-field">
                  <label htmlFor="contact-name">Contact Person</label>
                  <input
                    id="contact-name"
                    type="text"
                    className="input-text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-email">Contact Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="input-text"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="contact-phone">Contact Phone</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="input-text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-actions-bar" style={{ marginTop: '32px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/venues')}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || conflicts.length > 0 || previewOccurrences.length === 0}
                >
                  {isSubmitting ? 'Submitting Requisition...' : 'Submit Booking Requisition'}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Summary & Occurrences Preview */}
          <div className="booking-sidebar">
            <div className="card-sidebar">
              <h3 className="card-sidebar-title">Requisition Summary</h3>

              {selectedVenue && (
                <div className="venue-mini-meta">
                  <strong>{selectedVenue.name}</strong>
                  <span>{selectedVenue.buildingName} &bull; {selectedVenue.floor}</span>
                  <span>Capacity: {selectedVenue.capacity ? `${selectedVenue.capacity} Persons` : 'Unverified'}</span>
                </div>
              )}

              <div className="occurrence-counter-box" style={{ marginTop: '16px' }}>
                <span className="counter-label">Computed Occurrences:</span>
                <span className="counter-num">{previewOccurrences.length}</span>
              </div>

              {conflicts.length > 0 && (
                <div className="alert-box alert-danger" style={{ marginTop: '12px' }}>
                  <strong>Conflict Detected:</strong> {conflicts.length} overlapping slot(s) active on this venue.
                </div>
              )}

              <div className="occurrences-scroll-box" style={{ marginTop: '14px' }}>
                <h4>Occurrences Preview</h4>
                {previewOccurrences.length === 0 ? (
                  <p className="table-subtext">No occurrences generated yet.</p>
                ) : (
                  <table className="data-table-compact">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewOccurrences.map((occ, idx) => {
                        const hasConflict = conflicts.some((c) => c.date === occ.date)
                        return (
                          <tr key={idx}>
                            <td>{occ.date}</td>
                            <td>{occ.startsAt}–{occ.endsAt}</td>
                            <td>
                              {hasConflict ? (
                                <span className="text-danger font-semibold">Conflict</span>
                              ) : (
                                <span className="text-success">Clear</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="sidebar-footer-note" style={{ marginTop: '16px' }}>
                <span>Submitting creates a PENDING hold across all occurrences. Only assigned venue approvers may approve or reject.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
