import mongoose from "mongoose";
import Venue from "../models/venue.js";
import { findClash } from "./availabilityService.js";

const MAX_DAYS_AHEAD = 30;

// Returns { error: { status, message } } on the first failed check,
// or { start, end, venue } when everything is valid.
export async function validateBookingInput(body) {
  const { venueId, eventName, purpose, contactInfo, startTime, endTime, studCount } = body;

  // 1. Required fields
  if (!venueId || !eventName || !purpose || !contactInfo || !startTime || !endTime || !studCount) {
    return { error: { status: 400, message: "Please fill in all required fields" } };
  }

  // 2. venueId must look like a real MongoDB id (otherwise findById throws)
  if (!mongoose.isValidObjectId(venueId)) {
    return { error: { status: 400, message: "Invalid venue id" } };
  }

  // 3. Valid dates
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: { status: 400, message: "Invalid date or time" } };
  }

  // 4. Start before end
  if (start >= end) {
    return { error: { status: 400, message: "End time must be after start time" } };
  }

  // 5. Not in the past
  const now = new Date();
  if (start < now) {
    return { error: { status: 400, message: "Start time cannot be in the past" } };
  }

  // 6. Within the 30-day window
  const maxDate = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  if (start > maxDate) {
    return { error: { status: 400, message: `Bookings can only be made ${MAX_DAYS_AHEAD} days ahead` } };
  }

  // 7. Student count is a whole number >= 1
  const count = Number(studCount);
  if (!Number.isInteger(count) || count < 1) {
    return { error: { status: 400, message: "Student count must be a whole number of at least 1" } };
  }

  // 8. Venue exists, is active, and is big enough
  const venue = await Venue.findById(venueId);
  if (!venue) {
    return { error: { status: 404, message: "Venue not found" } };
  }
  if (venue.isActive === false) {
    return { error: { status: 400, message: "This venue is not available for booking" } };
  }
  if (count > venue.capacity) {
    return { error: { status: 400, message: `Student count exceeds venue capacity (${venue.capacity})` } };
  }

  // 9. No clash (409 = conflict)
  const clash = await findClash(venueId, start, end);
  if (clash) {
    return { error: { status: 409, message: "Venue is already booked for this time slot" } };
  }

  return { start, end, venue };
}