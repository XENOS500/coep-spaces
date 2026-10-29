import { api } from "./api.js";

function mapBooking(booking) {
  return {
    ...booking,
    id: booking._id,
    venueId: booking.venue?._id || booking.venue,
    venue: booking.venue?.name || "Venue no longer available",
    requester: booking.requester?.name || "Requester no longer available",
    email: booking.requester?.email || "",
    attendees: booking.studCount,
  };
}
export async function fetchMyBookings(signal) {
  return (await api("/bookings/my", { signal })).map(mapBooking);
}
export async function createBooking(body) {
  return mapBooking(await api("/bookings", { method: "POST", body }));
}
export async function cancelBooking(id) {
  return mapBooking(await api("/bookings/" + id + "/cancel", { method: "PATCH" }));
}
export async function checkAvailability(venueId, start, end, signal) {
  const query = new URLSearchParams({ venueId, start, end });
  return api("/bookings/availability?" + query, { signal });
}
export async function fetchApprovals(signal) {
  const data = await api("/approvals/pending", { signal });
  return data.approvals.map(mapBooking);
}
export async function decideBooking(id, status, rejectionReason) {
  const data = await api("/approvals/" + id, { method: "PATCH", body: { status, rejectionReason } });
  return mapBooking(data.booking);
}
