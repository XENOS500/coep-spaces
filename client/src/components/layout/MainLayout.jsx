import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuth } from '../../hooks/useAuth'

export default function MainLayout({ children }) {
  const { user } = useAuth()

  // Automatic persona theme selection based on authenticated user
  const personaTheme = (() => {
    if (!user) return 'theme-guest'
    if (user.email === 'student.lead@coep.ac.in' || user.id === 'u-req-2') return 'theme-student-lead'
    if (user.email === 'requester@coep.ac.in' || user.id === 'u-req-1') return 'theme-coordinator'
    if (user.role === 'APPROVER') return 'theme-hod'
    if (user.role === 'ADMIN') return 'theme-admin'
    return `theme-${user.role.toLowerCase()}`
  })()

  return (
    <div className={`app-shell ${personaTheme}`} data-role={user?.role || 'GUEST'}>
      <Navbar />
      <main className="app-main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}
