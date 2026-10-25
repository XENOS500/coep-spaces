import BASE_URL from './api'

export const bookingService = {
  getBookings: async () => {
    const res = await fetch(`${BASE_URL}/bookings`)
    return res.json()
  },
  createBooking: async (bookingData) => {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    })
    return res.json()
  }
}

