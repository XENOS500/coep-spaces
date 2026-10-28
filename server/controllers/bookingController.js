import mongoose from "mongoose";
import Booking from "../models/bookings.js";
import Venue from "../models/venue.js";
import { validateBookingInput } from "../services/bookingValidationService.js";
import { isVenueAvailable, getBookingsForDay } from "../services/availabilityService.js";


//POST /api/booking
export const createBooking = async (req, res) => {
    try {
        const result = await validateBookingInput(req.body);
        if (result.error) {
            return res.status(result.error.status).json({ message: result.error.message });
        }
        const { eventName, purpose, contactInfo, studCount, venueId } = req.body;
        const booking = await Booking.create({
            venue: venueId,
            requester: req.user.id,
            eventName,
            purpose, contactInfo, startTime: result.start,
            endTime: result.end,
            studCount: Number(studCount),
        });
        res.status(201).json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
// GET /api/bookings/my
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ requester: req.user.id }).populate('venue', 'name location').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
//PATCH /api/bookings/:id//cancel
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'booking not found' });
        }
        if (booking.requester.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You can only cancel your own bookings' });
        }
        if (!['Pending', 'Approved'].includes(booking.status)) {
            return res.status(400).json({ message: `A ${booking.status} booking cannot be cancelled` });
        }
        if (booking.startTime <= new Date()) {
            return res.status(400).json({ message: 'this booking ha already started' });
        }
        booking.status = 'Cancelled';
        await booking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
// GET /api/bookings/venue/:venueId?date=2026-11-05
export const getVenueBookings = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: 'Provide date as YYYY-MM-DD' });
        }
        const bookings = await getBookingsForDay(req.params.venueId, date);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
// GET /api/bookings/availability?venueId=...&start=...&end=...
export const checkAvailability = async (req, res) => {
    try {
        const { venueId, start, end } = req.query;
        const s = new Date(start);
        const e = new Date(end);

        if (!venueId || isNaN(s.getTime()) || isNaN(e.getTime()) || s >= e) {
            return res.status(400).json({ message: 'Provide venueId and a valid start/end time' });
        }
        const available = await isVenueAvailable(venueId, s, e);
        res.json({ available });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};