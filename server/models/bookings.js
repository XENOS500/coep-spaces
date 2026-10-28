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
            type: Date,
            required: true
        },
        endTime: {
            type: Date,
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
        },
        studCount: { type: Number, required: true, min: 1 },
    },
    { timestamps: true }
);

bookingSchema.index({ venue: 1, startTime: 1, endTime: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
