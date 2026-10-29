import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        capacity: {
            type: Number,
            required: true,
            min: 1
        },
        facilities: {
            type: [String],
            default: []
        },
        type: { type: String, trim: true, default: "Campus venue" },
        floor: { type: String, trim: true, default: "" },
        room: { type: String, trim: true, default: "" },
        image: { type: String, trim: true, default: "" },
        approver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
