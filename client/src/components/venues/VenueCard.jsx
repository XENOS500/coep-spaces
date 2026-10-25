import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function VenueCard({ venue }) {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const isVerifiedCapacity = venue.capacity !== null && venue.capacity > 0
  const canBook = venue.bookingEnabled && isVerifiedCapacity

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/book/${venue.id}`)
    } else if (user.role === 'REQUESTER') {
      navigate(`/book/${venue.id}`)
    } else {
      alert(`Accounts with role ${user.role} cannot submit booking requests. Please sign in with a REQUESTER account.`)
    }
  }

  return (
    <article className="venue-card">
      <div className="venue-card-media">
        {venue.imageSourceUrl ? (
          <img
            src={venue.imageSourceUrl}
            alt={venue.name}
            className="venue-card-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className="venue-card-fallback"
          style={{ display: venue.imageSourceUrl ? 'none' : 'flex' }}
        >
          <span className="fallback-code">{venue.roomReferenceRaw || venue.name}</span>
          <span className="fallback-label">{venue.buildingName}</span>
        </div>

        <div className="venue-card-flags">
          <span className="badge-type">{venue.venueType}</span>
          {canBook ? (
            <span className="badge-status-active">Booking Enabled</span>
          ) : (
            <span className="badge-status-blocked">
              {!isVerifiedCapacity ? 'Unverified Capacity' : 'Booking Disabled'}
            </span>
          )}
        </div>
      </div>

      <div className="venue-card-body">
        <div className="venue-card-header">
          <span className="venue-serial">Sr No. {venue.sourceSerial}</span>
          <h3 className="venue-name">
            <Link to={`/venues/${venue.id}`}>{venue.name}</Link>
          </h3>
          <p className="venue-location">
            {venue.buildingName} &bull; {venue.floor}
          </p>
        </div>

        <dl className="venue-specs-list">
          <div className="spec-item">
            <dt>Capacity</dt>
            <dd>
              {isVerifiedCapacity ? (
                <strong>{venue.capacity} Persons</strong>
              ) : (
                <span className="unverified-text">Not provided (Verification pending)</span>
              )}
            </dd>
          </div>

          <div className="spec-item">
            <dt>Room Ref</dt>
            <dd>{venue.roomReferenceRaw || 'Not provided'}</dd>
          </div>

          <div className="spec-item">
            <dt>Operating Hours</dt>
            <dd>{venue.openingTime} – {venue.closingTime}</dd>
          </div>

          <div className="spec-item">
            <dt>Features</dt>
            <dd className="spec-features">{venue.features || 'Not provided'}</dd>
          </div>

          <div className="spec-item">
            <dt>Allowed Uses</dt>
            <dd className="spec-uses">{venue.allowedUses || 'Not provided'}</dd>
          </div>
        </dl>

        <div className="venue-card-actions">
          <Link to={`/venues/${venue.id}`} className="btn-secondary btn-sm">
            View Details
          </Link>

          {canBook ? (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={handleBookClick}
            >
              Book Venue
            </button>
          ) : (
            <button
              type="button"
              className="btn-disabled btn-sm"
              disabled
              title="Booking is disabled for this venue until verified by administration"
            >
              Requests Blocked
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
