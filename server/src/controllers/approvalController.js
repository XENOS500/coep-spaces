import Booking from "../models/bookings.js";
import Venue from "../models/venue.js";
import mongoose from "mongoose";

export const getPendingApprovals = async (req, res) => {
  const venues = await Venue.find({ approver: req.user._id }).select("_id");
  const approvals = await Booking.find({ status: "PENDING", venue: { $in: venues.map(venue => venue._id) } })
    .populate("venue", "name location")
    .populate("requester", "name email")
    .sort({ createdAt: 1 });
  res.json({ approvals });
};

export const updateApprovalStatus = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid booking ID" });
  const { status, rejectionReason } = req.body ?? {};
  if (!["APPROVED", "REJECTED"].includes(status)) return res.status(400).json({ message: "Status must be APPROVED or REJECTED" });
  if (rejectionReason !== undefined && typeof rejectionReason !== "string") return res.status(400).json({ message: "Invalid rejection reason" });
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  const assigned = await Venue.exists({ _id: booking.venue, approver: req.user._id });
  if (!assigned) return res.status(403).json({ message: "This venue is not assigned to you" });
  if (booking.status !== "PENDING") return res.status(409).json({ message: "This booking has already been decided or cancelled" });
  if (status === "APPROVED") {
    const clash = await Booking.exists({
      _id: { $ne: booking._id }, venue: booking.venue, status: "APPROVED",
      startTime: { $lt: booking.endTime }, endTime: { $gt: booking.startTime },
    });
    if (clash) return res.status(409).json({ message: "This venue is already booked for an overlapping time slot" });
  }
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, status: "PENDING" },
    { status, rejectionReason: status === "REJECTED" ? (rejectionReason || "").trim() : "" },
    { returnDocument: "after", runValidators: true },
  ).populate("venue", "name location").populate("requester", "name email");
  if (!updated) return res.status(409).json({ message: "This booking has already been decided or cancelled" });
  res.json({ message: status === "APPROVED" ? "Booking approved successfully" : "Booking rejected successfully", booking: updated });
};
