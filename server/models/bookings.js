import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        venue: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Venue",
            required: true
        },
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        purpose: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        }
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
