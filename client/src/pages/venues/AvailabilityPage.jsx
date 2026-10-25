import React, { useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AvailabilityPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { venues, checkConflicts, user, isAuthenticated } = useAuth()

  const defaultVenueId = searchParams.get('venueId') || (venues[0]?.id || '')

  // Form State
  const [selectedVenueId, setSelectedVenueId] = useState(defaultVenueId)
  const [scheduleType, setScheduleType] = useState('SINGLE') // 'SINGLE' | 'RECURRING'
  
  // 30-day window limits in Asia/Kolkata
  const today = new Date().toISOString().split('T')[0]
  const maxDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  }, [])

  const [singleDate, setSingleDate] = useState(today)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [selectedWeekdays, setSelectedWeekdays] = useState([1, 2, 3, 4, 5]) // Mon-Fri
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('11:00')

  const [validationResult, setValidationResult] = useState(null)
  const [validationError, setValidationError] = useState('')

  const selectedVenue = venues.find((v) => v.id === selectedVenueId)

  // Weekday toggle
  const toggleWeekday = (dayNum) => {
    if (selectedWeekdays.includes(dayNum)) {
      if (selectedWeekdays.length === 1) return // at least 1 weekday required
      setSelectedWeekdays(selectedWeekdays.filter((d) => d !== dayNum))
    } else {
      setSelectedWeekdays([...selectedWeekdays, dayNum].sort())
    }
  }

  // Generate Occurrences & Validate
  const handleValidateSchedule = (e) => {
    e.preventDefault()
    setValidationError('')
    setValidationResult(null)

    if (!selectedVenue) {
      setValidationError('Please select a valid campus venue.')
      return
    }

    if (startTime >= endTime) {
      setValidationError('End time must be strictly after start time on the same date (no overnight bookings permitted).')
      return
    }

    // Operating hours check
    if (startTime < selectedVenue.openingTime || endTime > selectedVenue.closingTime) {
      setValidationError(
        `Selected interval (${startTime} - ${endTime}) exceeds venue operating hours (${selectedVenue.openingTime} - ${selectedVenue.closingTime}).`
      )
      return
    }

    const occurrences = []

    if (scheduleType === 'SINGLE') {
      if (singleDate < today || singleDate > maxDate) {
        setValidationError(`Date must fall strictly within the 30-day booking horizon (${today} to ${maxDate}).`)
        return
      }
      occurrences.push({
        date: singleDate,
        startsAt: startTime,
        endsAt: endTime
      })
    } else {
      if (startDate > endDate) {
        setValidationError('Recurrence start date cannot be after end date.')
        return
      }
      if (startDate < today || endDate > maxDate) {
        setValidationError(`All recurring dates must fall strictly within the 30-day booking horizon (${today} to ${maxDate}).`)
        return
      }

      // Generate dates
      const curr = new Date(`${startDate}T00:00:00`)
      const end = new Date(`${endDate}T00:00:00`)

      while (curr <= end) {
        // ISO weekday: 1 = Mon, 7 = Sun
        const dayOfWeek = curr.getDay() === 0 ? 7 : curr.getDay()
        if (selectedWeekdays.includes(dayOfWeek)) {
          const dateStr = curr.toISOString().split('T')[0]
          occurrences.push({
            date: dateStr,
            startsAt: startTime,
            endsAt: endTime
          })
        }
        curr.setDate(curr.getDate() + 1)
      }
    }

    if (occurrences.length === 0) {
      setValidationError('No occurrences were generated. Ensure selected weekdays fall within the start and end dates.')
      return
    }

    // Check conflicts
    const conflicts = checkConflicts(selectedVenue.id, occurrences)

    setValidationResult({
      occurrences,
      conflicts,
      hasConflicts: conflicts.length > 0
    })
  }

  const handleProceedToBooking = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/book/${selectedVenue.id}`)
    } else if (user.role === 'REQUESTER') {
      // Transfer schedule parameters via state
      navigate(`/book/${selectedVenue.id}`, {
        state: {
          scheduleType,
          singleDate,
          startDate,
          endDate,
          selectedWeekdays,
          startTime,
          endTime,
          occurrences: validationResult?.occurrences || []
        }
      })
    } else {
      alert(`Accounts with role ${user.role} cannot submit bookings. Please sign in with a REQUESTER account.`)
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
      {/* Top Header */}
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Check Availability</span>
          </div>

          <h1 className="header-title">Schedule Availability & Conflict Validator</h1>
          <p className="header-desc">
            Verify reservation eligibility across the 30-day institutional horizon. Single and recurring series are checked against active holds in real time.
          </p>
        </div>
      </div>

      <div className="container page-content">
        <div className="availability-layout-grid">
          {/* Form Panel */}
          <div className="availability-form-card">
            <h2 className="card-section-title">Configure Query Schedule</h2>
            <p className="section-body-text" style={{ marginBottom: '20px' }}>
              All schedules are evaluated under <code>Asia/Kolkata</code> timezone. Advance reservations are permitted up to 30 calendar days from today.
            </p>

            {validationError && (
              <div className="alert-box alert-warning" style={{ marginBottom: '18px' }}>
                {validationError}
              </div>
            )}

            <form onSubmit={handleValidateSchedule} className="availability-form">
              <div className="form-field">
                <label htmlFor="venue-picker">Select Facility</label>
                <select
                  id="venue-picker"
                  className="input-select"
                  value={selectedVenueId}
                  onChange={(e) => {
                    setSelectedVenueId(e.target.value)
                    setValidationResult(null)
                  }}
                  required
                >
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.buildingName}) — {v.capacity !== null ? `${v.capacity} seats` : 'Unverified'}
                    </option>
                  ))}
                </select>
                {selectedVenue && (
                  <span className="form-hint">
                    Operating Hours: {selectedVenue.openingTime} to {selectedVenue.closingTime} &bull; Classification: {selectedVenue.venueType}
                  </span>
                )}
              </div>

              {/* Schedule Type Toggle */}
              <div className="form-field">
                <label>Schedule Frequency</label>
                <div className="radio-button-group">
                  <label className={`radio-pill ${scheduleType === 'SINGLE' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="scheduleType"
                      value="SINGLE"
                      checked={scheduleType === 'SINGLE'}
                      onChange={() => {
                        setScheduleType('SINGLE')
                        setValidationResult(null)
                      }}
                    />
                    Single Date Occurrence
                  </label>
                  <label className={`radio-pill ${scheduleType === 'RECURRING' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="scheduleType"
                      value="RECURRING"
                      checked={scheduleType === 'RECURRING'}
                      onChange={() => {
                        setScheduleType('RECURRING')
                        setValidationResult(null)
                      }}
                    />
                    Recurring Series (Weekly)
                  </label>
                </div>
              </div>

              {/* Single Date Input */}
              {scheduleType === 'SINGLE' ? (
                <div className="form-field">
                  <label htmlFor="single-date">Event Date</label>
                  <input
                    id="single-date"
                    type="date"
                    className="input-text"
                    min={today}
                    max={maxDate}
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    required
                  />
                  <span className="form-hint">Permitted advance range: {today} to {maxDate}</span>
                </div>
              ) : (
                /* Recurring Inputs */
                <>
                  <div className="form-row-2">
                    <div className="form-field">
                      <label htmlFor="start-date">Series Start Date</label>
                      <input
                        id="start-date"
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
                      <label htmlFor="end-date">Series End Date</label>
                      <input
                        id="end-date"
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
                    <label>Active ISO Weekdays</label>
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
                    <span className="form-hint">Select at least one weekday. Occurrences will be generated for these days.</span>
                  </div>
                </>
              )}

              {/* Time Range Inputs */}
              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="start-time">Daily Start Time</label>
                  <input
                    id="start-time"
                    type="time"
                    className="input-text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="end-time">Daily End Time</label>
                  <input
                    id="end-time"
                    type="time"
                    className="input-text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-actions-bar">
                <button type="submit" className="btn-primary">
                  Validate Schedule & Check Conflicts
                </button>
              </div>
            </form>
          </div>

          {/* Validation Results Panel */}
          <div className="availability-results-card">
            <h2 className="card-section-title">Verification Outcome</h2>

            {!validationResult ? (
              <div className="placeholder-result-box">
                <p>Configure a proposed schedule on the left and click <strong>Validate Schedule</strong> to compute occurrences and inspect potential conflicts.</p>
              </div>
            ) : (
              <div className="result-details-content">
                {validationResult.hasConflicts ? (
                  <div className="alert-box alert-danger">
                    <strong>Schedule Conflict Detected:</strong> The requested venue has overlapping pending or approved reservations for {validationResult.conflicts.length} occurrence(s). A booking requisition cannot be submitted with conflicting slots.
                  </div>
                ) : (
                  <div className="alert-box alert-success">
                    <strong>All Slots Verified Clear:</strong> No conflicting reservations detected across all {validationResult.occurrences.length} occurrence(s). This schedule is valid for submission.
                  </div>
                )}

                <div className="result-stats-strip">
                  <div className="stat-unit">
                    <span className="stat-label">Generated Occurrences</span>
                    <span className="stat-val">{validationResult.occurrences.length}</span>
                  </div>
                  <div className="stat-unit">
                    <span className="stat-label">Conflict Status</span>
                    <span className={`stat-val ${validationResult.hasConflicts ? 'text-danger' : 'text-success'}`}>
                      {validationResult.hasConflicts ? `${validationResult.conflicts.length} Overlaps` : '0 Conflicts'}
                    </span>
                  </div>
                </div>

                {/* Conflict Detail if any */}
                {validationResult.hasConflicts && (
                  <div className="conflict-list-table">
                    <h4>Conflicting Intervals</h4>
                    <table className="data-table-compact">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Requested</th>
                          <th>Conflicting Active Slot</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationResult.conflicts.map((c, idx) => (
                          <tr key={idx}>
                            <td>{c.date}</td>
                            <td>{c.requestedSlot}</td>
                            <td>{c.conflictingSlot}</td>
                            <td><span className="badge-status-blocked">{c.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Occurrences List */}
                <div className="occurrences-preview-table" style={{ marginTop: '20px' }}>
                  <h4>Generated Occurrences Series</h4>
                  <table className="data-table-compact">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Time Interval</th>
                        <th>Verification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.occurrences.slice(0, 10).map((occ, idx) => {
                        const isConflict = validationResult.conflicts.some((c) => c.date === occ.date)
                        const d = new Date(`${occ.date}T00:00:00`)
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
                        return (
                          <tr key={idx}>
                            <td>{occ.date}</td>
                            <td>{dayName}</td>
                            <td>{occ.startsAt} – {occ.endsAt}</td>
                            <td>
                              {isConflict ? (
                                <span className="text-danger">Conflict</span>
                              ) : (
                                <span className="text-success">Available</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {validationResult.occurrences.length > 10 && (
                    <span className="table-subtext">Showing first 10 of {validationResult.occurrences.length} occurrences</span>
                  )}
                </div>

                {!validationResult.hasConflicts && (
                  <div className="action-proceed-box" style={{ marginTop: '24px' }}>
                    <button
                      type="button"
                      className="btn-primary btn-block"
                      onClick={handleProceedToBooking}
                    >
                      Proceed to Booking with this Schedule &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

