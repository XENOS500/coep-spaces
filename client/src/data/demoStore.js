
const VENUES_KEY = "coepDemoVenues";
const BOOKINGS_KEY = "coepDemoBookings";

export const DEMO_APPROVERS = ["Dr. Kulkarni", "Prof. Deshmukh", "Dr. Patil"];

export const initialVenues = [
  {
    id: "venue-1",
    name: "Main Auditorium",
    type: "Auditorium",
    building: "Main Building",
    room: "Auditorium A",
    capacity: 500,
    approver: "Dr. Kulkarni",
    active: true,
  },
  {
    id: "venue-2",
    name: "Seminar Hall 1",
    type: "Seminar Hall",
    building: "Academic Block",
    room: "First Floor",
    capacity: 100,
    approver: "Prof. Deshmukh",
    active: true,
  },
  {
    id: "venue-3",
    name: "Classroom B204",
    type: "Classroom",
    building: "Engineering Block B",
    room: "Room 204",
    capacity: 60,
    approver: "Dr. Patil",
    active: false,
  },
];

export const initialBookings = [
  {
    id: "BK-1024",
    requester: "Aarav Kulkarni",
    email: "aarav@example.com",
    venueId: "venue-1",
    venue: "Main Auditorium",
    date: "2026-11-05",
    startTime: "10:00",
    endTime: "12:00",
    attendees: 120,
    purpose: "Technical workshop",
    status: "PENDING",
  },
  {
    id: "BK-1025",
    requester: "Mira Shah",
    email: "mira@example.com",
    venueId: "venue-2",
    venue: "Seminar Hall 1",
    date: "2026-11-06",
    startTime: "14:00",
    endTime: "16:00",
    attendees: 45,
    purpose: "Student club meeting",
    status: "PENDING",
  },
  {
    id: "BK-1026",
    requester: "Dev Patil",
    email: "dev@example.com",
    venueId: "venue-3",
    venue: "Classroom B204",
    date: "2026-11-07",
    startTime: "09:00",
    endTime: "11:00",
    attendees: 25,
    purpose: "Project discussion",
    status: "PENDING",
  },
];

function readList(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

// Dispatch a custom event so any component can refresh after a store write.
export function dispatchStoreEvent() {
  window.dispatchEvent(new CustomEvent("coepStoreUpdate"));
}

export function getVenues() {
  return readList(VENUES_KEY, initialVenues);
}

export function saveVenues(venues) {
  localStorage.setItem(VENUES_KEY, JSON.stringify(venues));
  dispatchStoreEvent();
}

export function getBookings() {
  return readList(BOOKINGS_KEY, initialBookings);
}

export function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  dispatchStoreEvent();
}

// Clears all demo store data from localStorage (for dev use).
export function resetStore() {
  localStorage.removeItem(VENUES_KEY);
  localStorage.removeItem(BOOKINGS_KEY);
  dispatchStoreEvent();
}
