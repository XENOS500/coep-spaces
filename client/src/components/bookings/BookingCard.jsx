import React from 'react'

export default function BookingCard({ booking }) {
  return (
    <div className="booking-card">
      <h4>{booking?.venueName || 'Booking'}</h4>
      <p>{booking?.date}</p>
    </div>
  )
}

