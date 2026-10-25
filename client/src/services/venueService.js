import BASE_URL from './api'

export const venueService = {
  getAllVenues: async () => {
    const res = await fetch(`${BASE_URL}/venues`)
    return res.json()
  },
  getVenueById: async (id) => {
    const res = await fetch(`${BASE_URL}/venues/${id}`)
    return res.json()
  }
}

