import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import VenueCatalogPage from './pages/venues/VenueCatalogPage'
import VenueDetailsPage from './pages/venues/VenueDetailsPage'
import AvailabilityPage from './pages/venues/AvailabilityPage'
import CalendarPage from './pages/bookings/CalendarPage'
import NewBookingPage from './pages/bookings/NewBookingPage'
import MyBookingsPage from './pages/bookings/MyBookingsPage'
import ApprovalsPage from './pages/approver/ApprovalsPage'
import ManageVenuesPage from './pages/admin/ManageVenuesPage'
import AssignApproversPage from './pages/admin/AssignApproversPage'
import LoginPage from './pages/auth/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import './App.css'

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          {/* Public & Shared Navigation Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/venues" element={<VenueCatalogPage />} />
          <Route path="/venues/:id" element={<VenueDetailsPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* REQUESTER Routes */}
          <Route path="/book" element={<NewBookingPage />} />
          <Route path="/book/:id" element={<NewBookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />

          {/* APPROVER Routes */}
          <Route path="/approver/requests" element={<ApprovalsPage />} />
          <Route path="/approver/history" element={<ApprovalsPage />} />

          {/* ADMIN Routes */}
          <Route path="/admin/venues" element={<ManageVenuesPage />} />
          <Route path="/admin/assign-approvers" element={<AssignApproversPage />} />

          {/* Backward compatibility aliases */}
          <Route path="/approvals" element={<Navigate to="/approver/requests" replace />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MainLayout>
    </Router>
  )
}

export default App
