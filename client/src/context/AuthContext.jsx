import React, { createContext, useState, useEffect } from 'react'
import { RAW_VENUES, INITIAL_APPROVER_ASSIGNMENTS } from '../services/venueData'

export const AuthContext = createContext(null)

// Pre-seeded directory of trusted accounts per PRD Section 2
export const SEED_ACCOUNTS = [
  {
    id: "u-req-1",
    email: "requester@coep.ac.in",
    password: "password123",
    name: "Prof. S. K. Patil",
    role: "REQUESTER",
    department: "Mechanical Engineering"
  },
  {
    id: "u-req-2",
    email: "student.lead@coep.ac.in",
    password: "password123",
    name: "Rohan Kulkarni",
    role: "REQUESTER",
    department: "MindSpark / Student Gymkhana"
  },
  {
    id: "u-approver-1",
    email: "approver.comp@coep.ac.in",
    password: "password123",
    name: "Dr. A. S. Deshmukh",
    role: "APPROVER",
    department: "Computer Engineering & Academic Complex"
  },
  {
    id: "u-approver-2",
    email: "approver.mech@coep.ac.in",
    password: "password123",
    name: "Prof. P. R. Joshi",
    role: "APPROVER",
    department: "Mechanical & Gymkhana Grounds"
  },
  {
    id: "u-approver-3",
    email: "approver.civil@coep.ac.in",
    password: "password123",
    name: "Dr. R. Z. Patel",
    role: "APPROVER",
    department: "Civil Engineering"
  },
  {
    id: "u-admin-1",
    email: "admin@coep.ac.in",
    password: "password123",
    name: "Estate Office Administrator",
    role: "ADMIN",
    department: "Campus Planning & Estate Administration"
  }
]

// Sample initial active bookings adhering to PRD data model
const INITIAL_BOOKINGS = [
  {
    id: "b-1001",
    requesterId: "u-req-1",
    venueId: "v-05", // NC 05
    eventTitle: "National Machine Learning Faculty Development Workshop",
    eventType: "Workshop",
    contactName: "Prof. S. K. Patil",
    contactEmail: "requester@coep.ac.in",
    contactPhone: "9822012345",
    guestCount: 65,
    details: "Five-day intensive technical curriculum for engineering faculty.",
    purpose: "Academic faculty development and hands-on laboratory exercises.",
    startDate: "2026-11-02",
    endDate: "2026-11-06",
    weekdays: [1, 2, 3, 4, 5],
    localStartTime: "09:30",
    localEndTime: "13:30",
    status: "APPROVED",
    createdAt: "2026-10-20T10:15:00Z",
    occurrences: [
      { id: "occ-1", date: "2026-11-02", startsAt: "09:30", endsAt: "13:30", status: "APPROVED" },
      { id: "occ-2", date: "2026-11-03", startsAt: "09:30", endsAt: "13:30", status: "APPROVED" },
      { id: "occ-3", date: "2026-11-04", startsAt: "09:30", endsAt: "13:30", status: "APPROVED" },
      { id: "occ-4", date: "2026-11-05", startsAt: "09:30", endsAt: "13:30", status: "APPROVED" },
      { id: "occ-5", date: "2026-11-06", startsAt: "09:30", endsAt: "13:30", status: "APPROVED" }
    ],
    actions: [
      {
        id: "act-1",
        actorId: "u-approver-1",
        actorName: "Dr. A. S. Deshmukh",
        action: "APPROVED",
        reason: "Sanctioned for institutional faculty development program.",
        createdAt: "2026-10-21T11:00:00Z"
      }
    ]
  },
  {
    id: "b-1002",
    requesterId: "u-req-2",
    venueId: "v-20", // Main Auditorium B.J. Hall
    eventTitle: "MindSpark 2026 Technical Exhibition Briefing",
    eventType: "Student Society Event",
    contactName: "Rohan Kulkarni",
    contactEmail: "student.lead@coep.ac.in",
    contactPhone: "9890123456",
    guestCount: 300,
    details: "Orientation and briefing for 300 volunteer coordinators.",
    purpose: "Annual national level technical festival orientation.",
    startDate: "2026-11-10",
    endDate: "2026-11-10",
    weekdays: [2],
    localStartTime: "16:00",
    localEndTime: "19:00",
    status: "PENDING",
    createdAt: "2026-10-24T14:30:00Z",
    occurrences: [
      { id: "occ-6", date: "2026-11-10", startsAt: "16:00", endsAt: "19:00", status: "PENDING" }
    ],
    actions: []
  }
]

export function AuthProvider({ children }) {
  // Current authenticated user session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('coep_active_account')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Venues repository (starts with 61 real venues from PRD)
  const [venues, setVenues] = useState(() => {
    try {
      const saved = localStorage.getItem('coep_venues_catalog')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length >= RAW_VENUES.length) {
          return parsed
        }
      }
      return RAW_VENUES
    } catch {
      return RAW_VENUES
    }
  })

  // Venue-to-Approver mapping
  const [approverAssignments, setApproverAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('coep_approver_assignments')
      return saved ? JSON.parse(saved) : INITIAL_APPROVER_ASSIGNMENTS
    } catch {
      return INITIAL_APPROVER_ASSIGNMENTS
    }
  })

  // All system bookings
  const [bookings, setBookings] = useState(() => {
    try {
      const saved = localStorage.getItem('coep_all_bookings')
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS
    } catch {
      return INITIAL_BOOKINGS
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('coep_active_account', JSON.stringify(user))
    } else {
      localStorage.removeItem('coep_active_account')
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem('coep_venues_catalog', JSON.stringify(venues))
  }, [venues])

  useEffect(() => {
    localStorage.setItem('coep_approver_assignments', JSON.stringify(approverAssignments))
  }, [approverAssignments])

  useEffect(() => {
    localStorage.setItem('coep_all_bookings', JSON.stringify(bookings))
  }, [bookings])

  // Authentication
  const login = (email, password = "") => {
    const account = SEED_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
    )
    if (!account) {
      throw new Error("No registered account found with this email. Access is restricted to pre-provisioned COEP accounts.")
    }
    setUser(account)
    return account
  }

  const logout = () => {
    setUser(null)
  }

  // Check if a venue is assigned to a specific approver
  const isApproverAssignedToVenue = (approverId, venueId) => {
    const assignedList = approverAssignments[venueId] || []
    return assignedList.includes(approverId)
  }

  // Conflict detection per PRD Section 4 Rule 4:
  // Same venue overlaps when newStart < existingEnd AND newEnd > existingStart.
  // PENDING and APPROVED hold slots. REJECTED and CANCELLED release them.
  const checkConflicts = (venueId, proposedOccurrences, excludeBookingId = null) => {
    const activeBookings = bookings.filter(
      (b) =>
        b.venueId === venueId &&
        b.id !== excludeBookingId &&
        (b.status === "PENDING" || b.status === "APPROVED")
    )

    const conflicts = []

    for (const prop of proposedOccurrences) {
      for (const b of activeBookings) {
        for (const occ of b.occurrences) {
          if (occ.date === prop.date) {
            // Check time overlap on same date
            // newStart < existingEnd AND newEnd > existingStart
            if (prop.startsAt < occ.endsAt && prop.endsAt > occ.startsAt) {
              conflicts.push({
                date: prop.date,
                requestedSlot: `${prop.startsAt} - ${prop.endsAt}`,
                conflictingSlot: `${occ.startsAt} - ${occ.endsAt}`,
                status: b.status,
                bookingId: b.id
              })
            }
          }
        }
      }
    }

    return conflicts
  }

  // Create booking (REQUESTER only)
  const createBooking = (bookingData) => {
    if (!user || user.role !== "REQUESTER") {
      throw new Error("Only accounts with role REQUESTER may submit venue booking requests.")
    }

    const venue = venues.find((v) => v.id === bookingData.venueId)
    if (!venue) throw new Error("Specified venue does not exist.")
    if (!venue.bookingEnabled) throw new Error("Booking is currently disabled for this venue.")
    if (venue.capacity === null) throw new Error("Venue capacity is unverified. Bookings are blocked until administrative review.")
    if (bookingData.guestCount > venue.capacity) {
      throw new Error(`Guest count (${bookingData.guestCount}) cannot exceed verified venue capacity (${venue.capacity}).`)
    }

    // Check approver assignment per PRD Section 4 Rule 8:
    // Unassigned venue cannot accept new requests
    const assignedApprovers = approverAssignments[venue.id] || []
    if (assignedApprovers.length === 0) {
      throw new Error("This venue currently has no assigned approver and cannot accept booking requisitions.")
    }

    // Conflict check
    const conflicts = checkConflicts(venue.id, bookingData.occurrences)
    if (conflicts.length > 0) {
      throw new Error(`Slot conflict detected on ${conflicts[0].date} (${conflicts[0].conflictingSlot}). Overlapping reservations are prohibited.`)
    }

    const newBooking = {
      id: "b-" + Math.floor(1000 + Math.random() * 9000),
      requesterId: user.id,
      venueId: venue.id,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      actions: [],
      ...bookingData
    }

    setBookings((prev) => [newBooking, ...prev])
    return newBooking
  }

  // Cancel booking (REQUESTER only, owning requester, before first occurrence)
  const cancelBooking = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) throw new Error("Booking not found.")

    if (!user || (user.id !== booking.requesterId && user.role !== "ADMIN")) {
      throw new Error("Only the owning requester may cancel this booking.")
    }

    if (booking.status === "CANCELLED" || booking.status === "REJECTED") {
      throw new Error("This booking is already finalized and cannot be cancelled.")
    }

    // Validate that first occurrence has not started
    const firstOcc = booking.occurrences[0]
    const now = new Date()
    const occDateTime = new Date(`${firstOcc.date}T${firstOcc.startsAt}:00`)
    if (now > occDateTime) {
      throw new Error("Cannot cancel a booking series after its start time has passed.")
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "CANCELLED",
              occurrences: b.occurrences.map((o) => ({ ...o, status: "CANCELLED" })),
              actions: [
                ...b.actions,
                {
                  id: "act-" + Date.now(),
                  actorId: user.id,
                  actorName: user.name,
                  action: "CANCELLED",
                  reason: "Cancelled by owning requester prior to commencement.",
                  createdAt: new Date().toISOString()
                }
              ]
            }
          : b
      )
    )
  }

  // Decide request (APPROVER only, assigned to venue, mandatory reason for rejection)
  const decideBooking = (bookingId, decision, reason = "") => {
    if (!user || user.role !== "APPROVER") {
      throw new Error("Only accounts with role APPROVER may decide booking requests.")
    }

    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) throw new Error("Booking request not found.")

    if (booking.status !== "PENDING") {
      throw new Error(`Cannot decide booking with status ${booking.status}. It is already finalized.`)
    }

    // Check assignment
    if (!isApproverAssignedToVenue(user.id, booking.venueId)) {
      throw new Error("You are not currently assigned as an approver for this venue.")
    }

    // Prevent self-approval per PRD Section 4 Rule 5
    if (booking.requesterId === user.id) {
      throw new Error("Self-approval is strictly prohibited under institutional audit rules.")
    }

    if (decision === "REJECTED" && (!reason || !reason.trim())) {
      throw new Error("A specific administrative reason is mandatory when declining a booking request.")
    }

    // If approving, re-check conflict transactionally
    if (decision === "APPROVED") {
      const conflicts = checkConflicts(booking.venueId, booking.occurrences, booking.id)
      if (conflicts.length > 0) {
        throw new Error(`Cannot approve: Conflict exists with slot on ${conflicts[0].date}.`)
      }
    }

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: decision,
              occurrences: b.occurrences.map((o) => ({ ...o, status: decision })),
              actions: [
                ...b.actions,
                {
                  id: "act-" + Date.now(),
                  actorId: user.id,
                  actorName: user.name,
                  action: decision,
                  reason: reason || "Approved in accordance with institutional policy.",
                  createdAt: new Date().toISOString()
                }
              ]
            }
          : b
      )
    )
  }

  // Admin: Update venue details or toggle active status
  const updateVenue = (venueId, updatedFields) => {
    if (!user || user.role !== "ADMIN") {
      throw new Error("Only ADMIN accounts may manage venue configurations.")
    }

    // Check deactivation rule per PRD Section 4 Rule 8:
    // Block deactivation while future pending/approved reservations exist
    if (updatedFields.bookingEnabled === false) {
      const activeFutureBookings = bookings.filter(
        (b) =>
          b.venueId === venueId &&
          (b.status === "PENDING" || b.status === "APPROVED")
      )
      if (activeFutureBookings.length > 0) {
        throw new Error(
          `Cannot deactivate venue: ${activeFutureBookings.length} future active/pending reservations exist. Requesters must cancel or complete eligible bookings first.`
        )
      }
    }

    setVenues((prev) =>
      prev.map((v) => (v.id === venueId ? { ...v, ...updatedFields } : v))
    )
  }

  // Admin: Create new venue
  const addVenue = (newVenue) => {
    if (!user || user.role !== "ADMIN") {
      throw new Error("Only ADMIN accounts may add venues.")
    }
    const id = "v-" + (venues.length + 1)
    const venueRecord = { id, sourceSerial: venues.length + 1, ...newVenue }
    setVenues((prev) => [...prev, venueRecord])
    return venueRecord
  }

  // Admin: Assign / remove approvers for venue
  const setVenueApprovers = (venueId, approverIds) => {
    if (!user || user.role !== "ADMIN") {
      throw new Error("Only ADMIN accounts may assign venue approvers.")
    }
    setApproverAssignments((prev) => ({
      ...prev,
      [venueId]: approverIds
    }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        venues,
        bookings,
        approverAssignments,
        createBooking,
        cancelBooking,
        decideBooking,
        updateVenue,
        addVenue,
        setVenueApprovers,
        checkConflicts,
        isApproverAssignedToVenue,
        seedAccounts: SEED_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
