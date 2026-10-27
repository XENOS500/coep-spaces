import Booking from "../models/bookings.js";
import Venue from "../models/venue.js";

export const createBooking = async (req, res) => {
    try {
        const { venue, date, startTime, endTime, purpose } = req.body;

        //All fields are must
        if (!venue || !date || !startTime || !endTime || !purpose) {
            return res.status(400).json( {message: "All booking fields are required"} );
        }

        const existingVenue = await Venue.findOne({
            _id: venue,
            isActive: true
        });

        if (!existingVenue) {
            return res.status(404).json( {message: "Venue not found or inactive"} );
        }

        if (startTime >= endTime) {
            return res.status(400).json( {message: "End time must be later than start time"} );
        }

        const booking = new Booking({
            venue: venue,
            requester: req.user._id,
            date: date,
            startTime: startTime,
            endTime: endTime,
            purpose: purpose,
            status: "PENDING"
        });

        const newBooking = await booking.save();

        return res.status(201).json( {message: "Booking request created successfully", booking: newBooking} );
    }
    catch (error) {
        console.error("Create booking error:", error);

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json( {message: "Invalid booking details"} );
        }

        return res.status(500).json( {message: "Failed to create booking"} );
    }
};