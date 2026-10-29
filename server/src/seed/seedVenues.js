import Venue from "../models/venue.js";

export async function seedVenues(venues) {
  for (const venue of venues) {
    if (!venue.name || !venue.location || !Number.isFinite(venue.capacity) || venue.capacity < 1) {
      throw new Error("Invalid seed venue: " + (venue.name || "unnamed"));
    }
  }
  for (const venue of venues) {
    await Venue.findOneAndUpdate(
      { name: venue.name, location: venue.location },
      { $set: venue },
      { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
    );
  }
}
