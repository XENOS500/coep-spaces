import Booking from "../models/bookings.js";
export const BLOCKING_STATUSES = ["PENDING", "APPROVED"];//these statuses block a time slot
// Returns the first booking that overlaps [start, end), or null.
// Overlap rule: existing.start < new.end AND existing.end > new.start
//exclude booking id allows to recheck a booking without clashing with itself
export async function findClash(venueId, start, end, excludeBookingId = null){
    const query = {
    venue: venueId,
    status: { $in: BLOCKING_STATUSES },
    startTime: { $lt: end },
    endTime: { $gt: start },
  };
  if (excludeBookingId) query._id = {$ne: excludeBookingId};
  return Booking.findOne(query);
}

export async function isVenueAvailable(venueId, start, end) {
  const clash = await findClash(venueId, start, end);
  return !clash;
}
// All Pending/Approved bookings for a venue on one day
//date format : YYYY-MM-DD (UTC day)
export async function getBookingsForDay(venueId, date){
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);
    return Booking.find(
        {
            venue: venueId,
            status: { $in: BLOCKING_STATUSES },
            startTime : {$lt: dayEnd},
            endTime : {$gt : dayStart},
        }
    ).select('startTime endTime status eventName').sort({startTime : 1});
}