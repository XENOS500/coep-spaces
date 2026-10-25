import BASE_URL from './api'

export const authService = {
  login: async (credentials) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    return res.json()
  },
  logout: async () => {
    localStorage.removeItem('token')
  }
}

