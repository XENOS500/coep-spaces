import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import VenueCard from '../../components/venues/VenueCard'

export default function VenueCatalogPage() {
  const { venues, user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState('ALL')
  const [selectedType, setSelectedType] = useState('ALL')
  const [selectedCapacityFilter, setSelectedCapacityFilter] = useState('ALL')
  const [selectedEligibility, setSelectedEligibility] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  // Extract unique building names
  const buildingOptions = useMemo(() => {
    const set = new Set(venues.map((v) => v.buildingName))
    return Array.from(set).sort()
  }, [venues])

  // Extract unique types
  const typeOptions = useMemo(() => {
    const set = new Set(venues.map((v) => v.venueType))
    return Array.from(set).sort()
  }, [venues])

  // Filter logic
  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      // Search
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        venue.name.toLowerCase().includes(query) ||
        venue.buildingName.toLowerCase().includes(query) ||
        (venue.roomReferenceRaw && venue.roomReferenceRaw.toLowerCase().includes(query)) ||
        (venue.features && venue.features.toLowerCase().includes(query)) ||
        (venue.allowedUses && venue.allowedUses.toLowerCase().includes(query))

      // Building
      const matchesBuilding =
        selectedBuilding === 'ALL' || venue.buildingName === selectedBuilding

      // Type
      const matchesType =
        selectedType === 'ALL' || venue.venueType === selectedType

      // Capacity
      let matchesCapacity = true
      if (selectedCapacityFilter === 'LT_50') {
        matchesCapacity = venue.capacity !== null && venue.capacity < 50
      } else if (selectedCapacityFilter === '50_TO_100') {
        matchesCapacity = venue.capacity !== null && venue.capacity >= 50 && venue.capacity <= 100
      } else if (selectedCapacityFilter === 'GT_100') {
        matchesCapacity = venue.capacity !== null && venue.capacity > 100
      } else if (selectedCapacityFilter === 'UNVERIFIED') {
        matchesCapacity = venue.capacity === null
      }

      // Eligibility
      let matchesEligibility = true
      if (selectedEligibility === 'ENABLED') {
        matchesEligibility = venue.bookingEnabled && venue.capacity !== null
      } else if (selectedEligibility === 'BLOCKED') {
        matchesEligibility = !venue.bookingEnabled || venue.capacity === null
      }

      return matchesSearch && matchesBuilding && matchesType && matchesCapacity && matchesEligibility
    })
  }, [venues, searchQuery, selectedBuilding, selectedType, selectedCapacityFilter, selectedEligibility])

  const totalCount = venues.length
  const unverifiedCount = venues.filter((v) => v.capacity === null).length
  const enabledCount = venues.filter((v) => v.bookingEnabled && v.capacity !== null).length

  return (
    <div className="page-shell">
      {/* Top Header */}
      <div className="page-header">
        <div className="container">
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="sep">/</span>
            <span className="current">Venue Catalog</span>
          </div>

          <div className="header-title-row">
            <div>
              <h1 className="header-title">Campus Venue Catalog</h1>
              <p className="header-desc">
                Official directory of all {totalCount} campus facilities across COEP departments. Check verified capacities, operating hours, and booking eligibility.
              </p>
            </div>

            {isAuthenticated && user.role === 'REQUESTER' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/book')}
              >
                Submit New Booking
              </button>
            )}
          </div>

          {/* Operational Metrics Strip */}
          <div className="catalog-summary-stats">
            <div className="summary-stat-cell">
              <span className="stat-label">Total Facilities</span>
              <span className="stat-value">{totalCount}</span>
            </div>
            <div className="summary-stat-cell">
              <span className="stat-label">Available for Booking</span>
              <span className="stat-value text-success">{enabledCount}</span>
            </div>
            <div className="summary-stat-cell">
              <span className="stat-label">Unverified Capacity</span>
              <span className="stat-value text-warning">{unverifiedCount} (Requests Blocked)</span>
            </div>
            <div className="summary-stat-cell">
              <span className="stat-label">Operating Schedule</span>
              <span className="stat-value">08:00 – 20:00 (Asia/Kolkata)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="container page-content">
        {/* Filters and Search Toolbar */}
        <div className="filters-card">
          <div className="filters-grid">
            <div className="filter-field">
              <label htmlFor="search-input">Search Venue or Keywords</label>
              <input
                id="search-input"
                type="text"
                className="input-text"
                placeholder="Search by venue name, room code, equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label htmlFor="building-select">Building Name</label>
              <select
                id="building-select"
                className="input-select"
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
              >
                <option value="ALL">All Buildings ({buildingOptions.length})</option>
                {buildingOptions.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="type-select">Venue Classification</label>
              <select
                id="type-select"
                className="input-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="ALL">All Classifications ({typeOptions.length})</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="capacity-select">Capacity Range</label>
              <select
                id="capacity-select"
                className="input-select"
                value={selectedCapacityFilter}
                onChange={(e) => setSelectedCapacityFilter(e.target.value)}
              >
                <option value="ALL">All Capacities</option>
                <option value="LT_50">Under 50 Persons</option>
                <option value="50_TO_100">50 to 100 Persons</option>
                <option value="GT_100">Over 100 Persons</option>
                <option value="UNVERIFIED">Unverified Only ({unverifiedCount})</option>
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="eligibility-select">Booking Eligibility</label>
              <select
                id="eligibility-select"
                className="input-select"
                value={selectedEligibility}
                onChange={(e) => setSelectedEligibility(e.target.value)}
              >
                <option value="ALL">All Records</option>
                <option value="ENABLED">Booking Enabled Only</option>
                <option value="BLOCKED">Blocked / Unverified Only</option>
              </select>
            </div>
          </div>

          <div className="filters-bottom-row">
            <span className="results-label">
              Showing <strong>{filteredVenues.length}</strong> of {totalCount} records
            </span>

            <div className="view-mode-toggle">
              <button
                type="button"
                className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </button>
              <button
                type="button"
                className={`btn-toggle ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Tabular View
              </button>
            </div>
          </div>
        </div>

        {/* Catalog Display */}
        {filteredVenues.length === 0 ? (
          <div className="empty-state-panel">
            <h3>No matching venues located</h3>
            <p>No facilities match your active filter parameters. Adjust search terms or clear selection.</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearchQuery('')
                setSelectedBuilding('ALL')
                setSelectedType('ALL')
                setSelectedCapacityFilter('ALL')
                setSelectedEligibility('ALL')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="venue-card-grid">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          /* Institutional Tabular View */
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Sr No</th>
                  <th>Venue Name</th>
                  <th>Building</th>
                  <th>Floor</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Features</th>
                  <th>Permitted Uses</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.map((venue) => {
                  const isVerified = venue.capacity !== null && venue.capacity > 0
                  const canBook = venue.bookingEnabled && isVerified
                  return (
                    <tr key={venue.id}>
                      <td className="cell-mono">{venue.sourceSerial}</td>
                      <td>
                        <Link to={`/venues/${venue.id}`} className="table-link">
                          <strong>{venue.name}</strong>
                        </Link>
                        {venue.roomReferenceRaw && (
                          <span className="table-subtext">Ref: {venue.roomReferenceRaw}</span>
                        )}
                      </td>
                      <td>{venue.buildingName}</td>
                      <td>{venue.floor}</td>
                      <td>
                        <span className="badge-type">{venue.venueType}</span>
                      </td>
                      <td>
                        {isVerified ? (
                          <span>{venue.capacity}</span>
                        ) : (
                          <span className="text-warning">Unverified</span>
                        )}
                      </td>
                      <td className="cell-wrap-features">{venue.features || 'Not provided'}</td>
                      <td className="cell-wrap-uses">{venue.allowedUses || 'Not provided'}</td>
                      <td>
                        {canBook ? (
                          <span className="badge-status-active">Active</span>
                        ) : (
                          <span className="badge-status-blocked">Blocked</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/venues/${venue.id}`} className="btn-secondary btn-xs">
                          Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
