import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ManageVenuesPage() {
  const { venues, updateVenue, addVenue, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [editingVenue, setEditingVenue] = useState(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    buildingName: '',
    floor: '',
    venueType: 'Class Room',
    roomReferenceRaw: '',
    capacity: 60,
    openingTime: '08:00',
    closingTime: '20:00',
    features: '',
    allowedUses: '',
    bookingEnabled: true
  })

  if (!isAuthenticated) {
    navigate('/login?redirect=/admin/venues')
    return null
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="container page-content">
        <div className="error-panel">
          <h2>Administrative Access Only</h2>
          <p>
            Your current account role is <strong>{user.role}</strong>. Only system accounts with role <strong>ADMIN</strong> may access the facility configuration desk.
          </p>
          <Link to="/venues" className="btn-secondary">Return to Venue Catalog</Link>
        </div>
      </div>
    )
  }

  const handleOpenEdit = (v) => {
    setActionError('')
    setActionSuccess('')
    setEditingVenue(v)
    setFormData({
      name: v.name,
      buildingName: v.buildingName,
      floor: v.floor,
      venueType: v.venueType,
      roomReferenceRaw: v.roomReferenceRaw || '',
      capacity: v.capacity || '',
      openingTime: v.openingTime || '08:00',
      closingTime: v.closingTime || '20:00',
      features: v.features || '',
      allowedUses: v.allowedUses || '',
      bookingEnabled: v.bookingEnabled
    })
  }

  const handleOpenNew = () => {
    setActionError('')
    setActionSuccess('')
    setIsAddingNew(true)
    setFormData({
      name: '',
      buildingName: 'Academic Complex Building',
      floor: 'Ground Floor',
      venueType: 'Class Room',
      roomReferenceRaw: '',
      capacity: 60,
      openingTime: '08:00',
      closingTime: '20:00',
      features: 'Projector, Wifi',
      allowedUses: 'Lecture, Presentation',
      bookingEnabled: true
    })
  }

  const handleSaveVenue = (e) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')

    const parsedCapacity = formData.capacity === '' ? null : parseInt(formData.capacity, 10)

    try {
      if (editingVenue) {
        updateVenue(editingVenue.id, {
          name: formData.name.trim(),
          buildingName: formData.buildingName.trim(),
          floor: formData.floor.trim(),
          venueType: formData.venueType,
          roomReferenceRaw: formData.roomReferenceRaw.trim(),
          capacity: parsedCapacity,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          features: formData.features.trim(),
          allowedUses: formData.allowedUses.trim(),
          bookingEnabled: formData.bookingEnabled
        })
        setActionSuccess(`Facility "${formData.name}" configuration updated successfully.`)
        setEditingVenue(null)
      } else if (isAddingNew) {
        addVenue({
          name: formData.name.trim(),
          buildingName: formData.buildingName.trim(),
          floor: formData.floor.trim(),
          venueType: formData.venueType,
          roomReferenceRaw: formData.roomReferenceRaw.trim(),
          capacity: parsedCapacity,
          openingTime: formData.openingTime,
          closingTime: formData.closingTime,
          features: formData.features.trim(),
          allowedUses: formData.allowedUses.trim(),
          bookingEnabled: formData.bookingEnabled,
          imageSourceUrl: null
        })
        setActionSuccess(`New facility record "${formData.name}" registered successfully.`)
        setIsAddingNew(false)
      }
    } catch (err) {
      setActionError(err.message)
    }
  }

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Manage Venues</span>
          </div>

          <div className="header-title-row">
            <div>
              <h1 className="header-title">Facility Configuration & Management</h1>
              <p className="header-desc">
                Administrative registry for all {venues.length} campus venues. Maintain verified capacities, operating hours, and booking eligibility.
              </p>
            </div>

            <div className="header-actions">
              <button type="button" className="btn-primary" onClick={handleOpenNew}>
                Register New Facility
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container page-content">
        {actionSuccess && (
          <div className="alert-box alert-success" style={{ marginBottom: '20px' }}>
            {actionSuccess}
          </div>
        )}

        {actionError && (
          <div className="alert-box alert-danger" style={{ marginBottom: '20px' }}>
            <strong>Configuration Error:</strong> {actionError}
          </div>
        )}

        {/* Venues Management Table */}
        <div className="card-section">
          <div className="section-title-row">
            <h2 className="card-section-title">All Registered Campus Facilities</h2>
            <span className="results-label">
              <strong>{venues.length}</strong> venues configured
            </span>
          </div>

          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Sr No</th>
                  <th>Facility Name</th>
                  <th>Building</th>
                  <th>Floor</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Hours</th>
                  <th>Eligibility</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr key={v.id}>
                    <td className="cell-mono">{v.sourceSerial}</td>
                    <td>
                      <strong>{v.name}</strong>
                      {v.roomReferenceRaw && <span className="table-subtext">Ref: {v.roomReferenceRaw}</span>}
                    </td>
                    <td>{v.buildingName}</td>
                    <td>{v.floor}</td>
                    <td><span className="badge-type">{v.venueType}</span></td>
                    <td>
                      {v.capacity !== null ? (
                        <span>{v.capacity} seats</span>
                      ) : (
                        <span className="text-warning">Unverified</span>
                      )}
                    </td>
                    <td>{v.openingTime} – {v.closingTime}</td>
                    <td>
                      {v.bookingEnabled && v.capacity !== null ? (
                        <span className="badge-status-active">Active</span>
                      ) : (
                        <span className="badge-status-blocked">
                          {!v.bookingEnabled ? 'Deactivated' : 'Unverified'}
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-secondary btn-xs"
                        onClick={() => handleOpenEdit(v)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Venue Modal */}
      {(editingVenue || isAddingNew) && (
        <div className="modal-backdrop">
          <div className="modal-box modal-lg">
            <h3 className="modal-title">
              {editingVenue ? `Edit Facility: ${editingVenue.name}` : 'Register New Campus Facility'}
            </h3>
            <p className="modal-body-text">
              Maintain audited facility parameters. Note: Deactivating a facility is blocked if future active reservations exist.
            </p>

            <form onSubmit={handleSaveVenue}>
              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="venue-name-input">Facility Name</label>
                  <input
                    id="venue-name-input"
                    type="text"
                    className="input-text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="building-name-input">Building Name</label>
                  <input
                    id="building-name-input"
                    type="text"
                    className="input-text"
                    value={formData.buildingName}
                    onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-field">
                  <label htmlFor="floor-input">Floor Level</label>
                  <input
                    id="floor-input"
                    type="text"
                    className="input-text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="type-input">Classification</label>
                  <select
                    id="type-input"
                    className="input-select"
                    value={formData.venueType}
                    onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
                  >
                    <option value="Class Room">Class Room</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar Hall">Seminar Hall</option>
                    <option value="Auditorium">Auditorium</option>
                    <option value="Meeting Room">Meeting Room</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="capacity-input">Verified Capacity</label>
                  <input
                    id="capacity-input"
                    type="number"
                    min="1"
                    placeholder="Leave blank if unverified"
                    className="input-text"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-field">
                  <label htmlFor="open-time-input">Opening Time (Asia/Kolkata)</label>
                  <input
                    id="open-time-input"
                    type="time"
                    className="input-text"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="close-time-input">Closing Time (Asia/Kolkata)</label>
                  <input
                    id="close-time-input"
                    type="time"
                    className="input-text"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="room-ref-input">Room Reference / Code</label>
                <input
                  id="room-ref-input"
                  type="text"
                  className="input-text"
                  placeholder="e.g. NC 05, ME-001"
                  value={formData.roomReferenceRaw}
                  onChange={(e) => setFormData({ ...formData, roomReferenceRaw: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="features-input">Installed Features & Audio-Visual</label>
                <input
                  id="features-input"
                  type="text"
                  className="input-text"
                  placeholder="e.g. Projector, Mic, Speaker, Wifi"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label htmlFor="uses-input">Permitted Uses</label>
                <input
                  id="uses-input"
                  type="text"
                  className="input-text"
                  placeholder="e.g. Lecture, Presentation, Lab"
                  value={formData.allowedUses}
                  onChange={(e) => setFormData({ ...formData, allowedUses: e.target.value })}
                />
              </div>

              <div className="form-field" style={{ marginTop: '16px' }}>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.bookingEnabled}
                    onChange={(e) => setFormData({ ...formData, bookingEnabled: e.target.checked })}
                  />
                  Enable Booking Requisitions for this Facility
                </label>
                <span className="form-hint">
                  Disabling booking will prevent future requisitions. Blocked if active future reservations exist.
                </span>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingVenue(null)
                    setIsAddingNew(false)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingVenue ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
