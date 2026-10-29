import User from "../models/user.js";
import Venue from "../models/venue.js";
import mongoose from "mongoose";

const populatedVenue = query => query.populate("approver", "name email");

export const getAdminVenues = async (req, res) => {
  const venues = await populatedVenue(Venue.find().sort({ name: 1 }));
  res.json({ venues });
};

export const getAdminVenue = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid venue ID" });
  const venue = await populatedVenue(Venue.findById(req.params.id));
  if (!venue) return res.status(404).json({ message: "Venue not found" });
  res.json({ venue });
};

export const getApprover = async (req, res) => {
  const approvers = await User.find({ role: "APPROVER" }).select("name email").sort({ name: 1 });
  res.json({ approvers });
};

async function venueInput(body = {}) {
  const updates = {};
  for (const field of ["name", "location", "type", "floor", "room", "image"]) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") throw Object.assign(new Error("Invalid " + field), { statusCode: 400 });
      updates[field] = body[field].trim();
    }
  }
  if (updates.image && !/^https?:\/\//i.test(updates.image)) {
    throw Object.assign(new Error("Image must be an HTTP or HTTPS URL"), { statusCode: 400 });
  }
  if (body.capacity !== undefined) {
    const capacity = Number(body.capacity);
    if (!Number.isInteger(capacity) || capacity < 1) throw Object.assign(new Error("Capacity must be a positive whole number"), { statusCode: 400 });
    updates.capacity = capacity;
  }
  if (body.facilities !== undefined) {
    if (!Array.isArray(body.facilities) || body.facilities.some(item => typeof item !== "string")) {
      throw Object.assign(new Error("Facilities must be a list of text values"), { statusCode: 400 });
    }
    updates.facilities = body.facilities.map(item => item.trim()).filter(Boolean);
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") throw Object.assign(new Error("Invalid active status"), { statusCode: 400 });
    updates.isActive = body.isActive;
  }
  if (body.approver !== undefined) {
    if (body.approver === null || body.approver === "") {
      updates.approver = null;
    } else {
      if (!mongoose.isValidObjectId(body.approver) || !(await User.exists({ _id: body.approver, role: "APPROVER" }))) {
        throw Object.assign(new Error("Choose an existing approver account"), { statusCode: 400 });
      }
      updates.approver = body.approver;
    }
  }
  return updates;
}

export const createVenue = async (req, res) => {
  const fields = await venueInput(req.body);
  if (!fields.name || !fields.location || !fields.capacity) return res.status(400).json({ message: "Name, location and capacity are required" });
  const saved = await Venue.create(fields);
  const venue = await populatedVenue(Venue.findById(saved._id));
  res.status(201).json({ message: "Venue created successfully", venue });
};

export const updateVenue = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid venue ID" });
  const updates = await venueInput(req.body);
  if (!Object.keys(updates).length) return res.status(400).json({ message: "Provide at least one field to update" });
  const venue = await populatedVenue(Venue.findByIdAndUpdate(req.params.id, { $set: updates }, { returnDocument: "after", runValidators: true }));
  if (!venue) return res.status(404).json({ message: "Venue not found" });
  res.json({ message: "Venue updated successfully", venue });
};

export const deactivateVenue = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid venue ID" });
  const venue = await populatedVenue(Venue.findByIdAndUpdate(req.params.id, { isActive: false }, { returnDocument: "after", runValidators: true }));
  if (!venue) return res.status(404).json({ message: "Venue not found" });
  res.json({ message: "Venue deactivated successfully", venue });
};

export const assignApprover = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: { $ne: "ADMIN" } }, { role: "APPROVER" }, { returnDocument: "after", runValidators: true }).select("name email role");
  if (!user) return res.status(404).json({ message: "User not found or already an administrator" });
  res.json({ message: "Approver role assigned successfully", user });
};

export const promoteApprover = async (req, res) => {
  const email = req.body?.email;
  if (typeof email !== "string" || !email.trim()) return res.status(400).json({ message: "Enter the registered user's email" });
  const user = await User.findOneAndUpdate({ email: email.trim().toLowerCase(), role: { $ne: "ADMIN" } }, { role: "APPROVER" }, { returnDocument: "after", runValidators: true }).select("name email role");
  if (!user) return res.status(404).json({ message: "Register this user first. Administrator accounts cannot be changed here." });
  res.json({ message: "Approver role assigned successfully", user });
};
