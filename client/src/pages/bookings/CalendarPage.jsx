import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function CalendarPage() {
  const { venues, bookings, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Selected filters
  const [selectedVenueId, setSelectedVenueId] = useState('ALL')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])

  // Extract all calendar occurrences
  const calendarItems = useMemo(() => {
    const items = []

    for (const b of bookings) {
      // Per PRD Section 4 Rule 3: PENDING and APPROVED reserve slots
      if (b.status !== 'APPROVED' && b.status !== 'PENDING') continue

      const venue = venues.find((v) => v.id === b.venueId)
      const isOwner = isAuthenticated && user?.id === b.requesterId
      const isApprover = isAuthenticated && user?.role === 'APPROVER'

      for (const occ of b.occurrences) {
        if (occ.status !== 'APPROVED' && occ.status !== 'PENDING') continue

        items.push({
          occurrenceId: occ.id,
          bookingId: b.id,
          venueId: b.venueId,
          venueName: venue?.name || 'Unknown Venue',
          buildingName: venue?.buildingName || '',
          date: occ.date,
          startsAt: occ.startsAt,
          endsAt: occ.endsAt,
          status: b.status,
          // Privacy protection per PRD Section 5:
          // Private contact, guest count, details, purpose visible only to owner or assigned approver
          eventTitle: isOwner || isApprover ? b.eventTitle : 'Reserved Institutional Event',
          organizer: isOwner || isApprover ? b.organizer : 'COEP Academic Department',
          isOwner,
          contactName: isOwner || isApprover ? b.contactName : 'Protected'
        })
      }
    }

    return items
  }, [bookings, venues, user, isAuthenticated])

  // Filter by selected venue and selected date
  const filteredItems = useMemo(() => {
    return calendarItems.filter((item) => {
      const matchesVenue = selectedVenueId === 'ALL' || item.venueId === selectedVenueId
      const matchesDate = item.date === selectedDate
      return matchesVenue && matchesDate
    }).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  }, [calendarItems, selectedVenueId, selectedDate])

  // Get distinct dates with bookings for quick selection
  const bookedDates = useMemo(() => {
    const set = new Set(calendarItems.map((i) => i.date))
    return Array.from(set).sort()
  }, [calendarItems])

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Master Calendar</span>
          </div>

          <div className="header-title-row">
            <div>
              <h1 className="header-title">Campus Venue Schedule & Occupancy Calendar</h1>
              <p className="header-desc">
                Public occupancy schedule across all COEP facilities. Displays approved reservations and your own pending holds. Personal details of other requesters are protected under institutional privacy policy.
              </p>
            </div>

            <div className="header-actions">
              <Link to="/availability" className="btn-secondary">Check Availability</Link>
              {isAuthenticated && user.role === 'REQUESTER' && (
                <Link to="/book" className="btn-primary">Submit Booking</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container page-content">
        {/* Calendar Filter Controls */}
        <div className="filters-card">
          <div className="filters-grid">
            <div className="filter-field">
              <label htmlFor="calendar-date-input">Select Date</label>
              <input
                id="calendar-date-input"
                type="date"
                className="input-text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="calendar-venue-select">Filter by Facility</label>
              <select
                id="calendar-venue-select"
                className="input-select"
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
              >
                <option value="ALL">All Facilities ({venues.length})</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.buildingName})</option>
                ))}
              </select>
            </div>
          </div>

          {bookedDates.length > 0 && (
            <div className="quick-dates-strip" style={{ marginTop: '14px' }}>
              <span className="subtext-label">Dates with Active Slots:</span>
              <div className="quick-date-pills">
                {bookedDates.slice(0, 8).map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`btn-tag-date ${selectedDate === d ? 'active' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Schedule Table */}
        <div className="card-section" style={{ marginTop: '24px' }}>
          <div className="section-title-row">
            <h2 className="card-section-title">
              Occupancy Schedule for {selectedDate}
            </h2>
            <span className="results-label">
              <strong>{filteredItems.length}</strong> slot(s) reserved
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state-panel">
              <p>No reservations recorded for {selectedDate} under current facility selection.</p>
              <p className="table-subtext">All operating slots on this date remain available for requisition submission.</p>
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time Interval</th>
                    <th>Facility Name</th>
                    <th>Building</th>
                    <th>Event Classification</th>
                    <th>Status</th>
                    <th>Ownership Note</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.occurrenceId} className={item.isOwner ? 'row-highlight-owner' : ''}>
                      <td className="cell-mono">
                        <strong>{item.startsAt} – {item.endsAt}</strong>
                      </td>
                      <td>
                        <strong>{item.venueName}</strong>
                      </td>
                      <td>{item.buildingName}</td>
                      <td>{item.eventTitle}</td>
                      <td>
                        {item.status === 'APPROVED' ? (
                          <span className="badge-status-active">Approved Hold</span>
                        ) : (
                          <span className="badge-status-pending">Pending Decision</span>
                        )}
                      </td>
                      <td>
                        {item.isOwner ? (
                          <span className="text-primary font-semibold">Your Requisition</span>
                        ) : (
                          <span className="table-subtext">Institutional Hold</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
