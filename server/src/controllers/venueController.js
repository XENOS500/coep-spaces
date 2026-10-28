import Venue from "../models/venue.js";
import mongoose from "mongoose";

export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ isActive: true });
    return res.status(200).json({ venues: venues });
  } catch (error) {
    console.error("Get venues error:", error);
    return res.status(500).json({ message: "Failed to fetch venues" });
  }
};

export const getVenueById = async (req, res) => {
  try {
    const venueId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(venueId)) {
      return res.status(400).json({ message: "Invalid venue ID" });
    }

    const venue = await Venue.findOne({
      _id: venueId,
      isActive: true,
    });

    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    return res.status(200).json({ venue: venue });
  } catch (error) {
    console.error("Get venue error:", error);

    return res.status(500).json({ message: "Failed to fetch venue" });
  }
};
