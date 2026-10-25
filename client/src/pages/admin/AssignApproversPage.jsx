import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function AssignApproversPage() {
  const { venues, approverAssignments, setVenueApprovers, seedAccounts, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || '')
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')

  if (!isAuthenticated) {
    navigate('/login?redirect=/admin/assign-approvers')
    return null
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="container page-content">
        <div className="error-panel">
          <h2>Administrative Access Only</h2>
          <p>
            Your current account role is <strong>{user.role}</strong>. Only system accounts with role <strong>ADMIN</strong> may assign venue approvers.
          </p>
          <Link to="/venues" className="btn-secondary">Return to Venue Catalog</Link>
        </div>
      </div>
    )
  }

  // Active approver directory
  const availableApprovers = seedAccounts.filter((acc) => acc.role === 'APPROVER')

  const currentVenue = venues.find((v) => v.id === selectedVenueId) || venues[0]
  const currentAssignedIds = approverAssignments[currentVenue?.id] || []

  const handleToggleApprover = (approverId) => {
    setActionError('')
    setActionSuccess('')

    let updated
    if (currentAssignedIds.includes(approverId)) {
      updated = currentAssignedIds.filter((id) => id !== approverId)
    } else {
      updated = [...currentAssignedIds, approverId]
    }

    try {
      setVenueApprovers(currentVenue.id, updated)
      setActionSuccess(`Approver roster updated for ${currentVenue.name}. (${updated.length} assigned)`)
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
            <span className="current">Assign Venue Approvers</span>
          </div>

          <div className="header-title-row">
            <div>
              <h1 className="header-title">Approver Delegation & Governance</h1>
              <p className="header-desc">
                Assign authorized APPROVER personnel to campus facilities. Requisitions can only be approved by accounts assigned here.
              </p>
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
            {actionError}
          </div>
        )}

        <div className="availability-layout-grid">
          {/* Venue Selection List */}
          <div className="card-section">
            <h2 className="card-section-title">Select Campus Facility</h2>
            <p className="section-body-text" style={{ marginBottom: '16px' }}>
              Choose a facility to inspect or modify its assigned decision-makers.
            </p>

            <div className="venue-picker-list">
              {venues.map((v) => {
                const count = (approverAssignments[v.id] || []).length
                const isSelected = v.id === currentVenue.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`venue-picker-row ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedVenueId(v.id)
                      setActionSuccess('')
                      setActionError('')
                    }}
                  >
                    <div>
                      <strong>{v.name}</strong>
                      <span className="picker-subtext">{v.buildingName} &bull; {v.venueType}</span>
                    </div>

                    <div>
                      {count > 0 ? (
                        <span className="badge-status-active">{count} Approver(s)</span>
                      ) : (
                        <span className="badge-status-blocked">0 (Unassigned)</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Approvers Roster Panel */}
          <div className="card-section">
            <h2 className="card-section-title">
              Assigned Approvers for {currentVenue?.name}
            </h2>
            <p className="section-body-text" style={{ marginBottom: '20px' }}>
              Toggle authorized approvers below. Multiple approvers are permitted; any assigned approver may decide pending series.
            </p>

            {currentAssignedIds.length === 0 && (
              <div className="alert-box alert-warning" style={{ marginBottom: '20px' }}>
                <strong>No Approver Assigned:</strong> Per institutional policy, an unassigned venue cannot accept new booking requests until an approver is delegated.
              </div>
            )}

            <div className="approver-directory-stack">
              {availableApprovers.map((app) => {
                const isAssigned = currentAssignedIds.includes(app.id)
                return (
                  <div key={app.id} className={`approver-card-item ${isAssigned ? 'assigned' : ''}`}>
                    <div className="approver-info">
                      <strong className="approver-name">{app.name}</strong>
                      <span className="approver-email">{app.email}</span>
                      <span className="approver-dept">{app.department}</span>
                    </div>

                    <div className="approver-action">
                      {isAssigned ? (
                        <button
                          type="button"
                          className="btn-danger-outline btn-sm"
                          onClick={() => handleToggleApprover(app.id)}
                        >
                          Remove Assignment
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          onClick={() => handleToggleApprover(app.id)}
                        >
                          Assign to Facility
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
