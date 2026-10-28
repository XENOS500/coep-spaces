import Booking from "../models/bookings.js";
import mongoose from "mongoose";

export const getPendingApprovals = async (req, res) => {
    try {
        const bookings = await Booking.find({
            status: "PENDING"
        });

        return res.status(200).json({
            approvals: bookings
        });
    }
    catch (error) {
        console.error("Get pending approvals error:", error);
        return res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
};

export const updateApprovalStatus = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const status = req.body.status;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "Invalid booking ID" });
        }

        if (status !== "APPROVED" && status !== "REJECTED") {
            return res.status(400).json({ message: "Status must be APPROVED or REJECTED" });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        if (booking.status !== "PENDING") {
            return res.status(400).json({ message: "Only pending bookings can be approved or rejected" });
        }

        if (status === "APPROVED") {
            const conflictingBooking = await Booking.findOne({
                _id: { $ne: booking._id },
                venue: booking.venue,
                date: booking.date,
                status: "APPROVED",
                startTime: { $lt: booking.endTime },
                endTime: { $gt: booking.startTime }
            });

            if (conflictingBooking) {
                return res.status(409).json({ message: "This venue is already booked for an overlapping time slot" });
            }
        }

        booking.status = status;

        const updatedBooking = await booking.save();

        return res.status(200).json({
            message: status === "APPROVED" ? "Booking approved successfully" : "Booking rejected successfully",
            booking: updatedBooking
        });
    }
    catch (error) {
        console.error("Update approval status error:", error);
        return res.status(500).json({ message: "Failed to update approval status" });
    }
};