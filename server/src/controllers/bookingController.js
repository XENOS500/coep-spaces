import mongoose from "mongoose";
import Booking from "../models/bookings.js";
import Venue from "../models/venue.js";
import { validateBookingInput } from "../services/bookingValidationService.js";
import { isVenueAvailable, getBookingsForDay } from "../services/availabilityService.js";

export const createBooking = async (req, res) => {
  const result = await validateBookingInput(req.body);
  if (result.error) return res.status(result.error.status).json({ message: result.error.message });
  const { eventName, purpose, contactInfo, studCount, venueId } = req.body;
  const booking = await Booking.create({
    venue: venueId, requester: req.user._id,
    eventName: eventName.trim(), purpose: purpose.trim(), contactInfo: contactInfo.trim(),
    date: new Date(Date.UTC(result.start.getUTCFullYear(), result.start.getUTCMonth(), result.start.getUTCDate())),
    startTime: result.start, endTime: result.end, studCount: Number(studCount),
  });
  await booking.populate("venue", "name location");
  res.status(201).json(booking);
};

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ requester: req.user._id }).populate("venue", "name location").sort({ createdAt: -1 });
  res.json(bookings);
};

export const cancelBooking = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid booking ID" });
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (!booking.requester.equals(req.user._id)) return res.status(403).json({ message: "You can only cancel your own bookings" });
  if (!["PENDING", "APPROVED"].includes(booking.status)) return res.status(400).json({ message: "This booking cannot be cancelled" });
  if (booking.startTime <= new Date()) return res.status(400).json({ message: "This booking has already started" });
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, requester: req.user._id, status: booking.status },
    { status: "CANCELLED" }, { returnDocument: "after", runValidators: true },
  ).populate("venue", "name location");
  if (!updated) return res.status(409).json({ message: "Booking changed. Refresh and try again." });
  res.json(updated);
};

export const getVenueBookings = async (req, res) => {
  const { date } = req.query;
  if (!mongoose.isValidObjectId(req.params.venueId)) return res.status(400).json({ message: "Invalid venue ID" });
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    return res.status(400).json({ message: "Provide a valid date as YYYY-MM-DD" });
  }
  res.json(await getBookingsForDay(req.params.venueId, date));
};

export const checkAvailability = async (req, res) => {
  const { venueId, start, end } = req.query;
  const s = new Date(start), e = new Date(end);
  if (!mongoose.isValidObjectId(venueId) || !Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime()) || s >= e) {
    return res.status(400).json({ message: "Provide venueId and a valid start/end time" });
  }
  const venue = await Venue.findOne({ _id: venueId, isActive: true });
  if (!venue) return res.status(404).json({ message: "Active venue not found" });
  res.json({ available: await isVenueAvailable(venueId, s, e) });
};
