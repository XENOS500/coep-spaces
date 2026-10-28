import User from "../models/user.js";
import Venue from "../models/venue.js";
import mongoose from "mongoose";

export const getApprover = async (req, res) => {
    try {
        const approvers = await User.find({ role: "APPROVER" }).select("-passwordHash");

        return res.status(200).json({
            approvers: approvers
        });
    }
    catch (error) {
        console.error("Get approvers error:", error);
        return res.status(500).json({ message: "Failed to fetch approvers" });
    }
};

export const createVenue = async (req, res) => {
    try {
        const { name, location, capacity, facilities } = req.body;

        if (!name || !location || capacity === undefined || capacity === null) {
            return res.status(400).json({ message: "All feilds are required" });
        }

        const venue = new Venue({
            name: name,
            location: location,
            capacity: capacity,
            facilities: facilities
        });

        const savedVenue = await venue.save();

        return res.status(201).json({
            message: "Venue created successfully",
            venue: savedVenue
        });
    }
    catch (error) {
        console.error("Create venue error:", error);

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: "Invalid venue details" });
        }

        return res.status(500).json({ message: "Failed to create venue" });
    }
};

export const updateVenue = async (req, res) => {
    try {
        const venueId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(venueId)) {
            return res.status(400).json({ message: "Invalid venue ID" });
        }

        const { name, location, capacity, facilities } = req.body;
        const updates = {};

        if (name !== undefined) {
            updates.name = name;
        }

        if (location !== undefined) {
            updates.location = location;
        }

        if (capacity !== undefined) {
            updates.capacity = capacity;
        }

        if (facilities !== undefined) {
            updates.facilities = facilities;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Provide at least one field to update" });
        }

        const venue = await Venue.findOneAndUpdate(
            {
                _id: venueId,
                isActive: true
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!venue) {
            return res.status(404).json({ message: "Active venue not found" });
        }

        return res.status(200).json({
            message: "Venue updated successfully",
            venue: venue
        });
    }
    catch (error) {
        console.error("Update venue error:", error);

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({ message: "Invalid venue details" });
        }

        return res.status(500).json({ message: "Failed to update venue" });
    }
};

export const deactivateVenue = async (req, res) => {
    try {
        const venueId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(venueId)) {
            return res.status(400).json({ message: "Invalid venue ID" });
        }

        const venue = await Venue.findByIdAndUpdate(
            venueId,
            {
                isActive: false
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!venue) {
            return res.status(404).json({ message: "Venue not found" });
        }

        return res.status(200).json({
            message: "Venue deactivated successfully",
            venue: venue
        });
    }
    catch (error) {
        console.error("Deactivate venue error:", error);

        return res.status(500).json({ message: "Failed to deactivate venue" });
    }
};

export const assignApprover = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                role: "APPROVER"
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-passwordHash");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Approver assigned successfully",
            user: user
        });
    }
    catch (error) {
        console.error("Assign approver error:", error);
        return res.status(500).json({ message: "Failed to assign approver" });
    }
};