const Booking = require('../models/Booking');
const BLOCKING_STATUSES = ['PENDING','APPROVED']; //these statuses block a time slot

//exclude booking id allows to recheck a booking without clashing with itself
async function findClash(venueId, start, end, excludeBookingId = null){
    const query = {
    venue: venueId,
    status: { $in: BLOCKING_STATUSES },
    startTime: { $lt: end },
    endTime: { $gt: start },
  };
  if (excludeBookingId) query._id = {$ne: excludeBookingId};
  return Booking.findOne(query);
}

async function isVenueAvailable(venueId, start, end) {
  const clash = await findClash(venueId, start, end);
  return !clash;
}

//date format : YYYY-MM-DD
async function getBookingsForDay(venueId, date){
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
module.exports = { findClash, isVenueAvailable, getBookingsForDay, BLOCKING_STATUSES };