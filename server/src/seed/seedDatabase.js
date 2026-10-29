import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { seedVenues } from "./seedVenues.js";
import venues from "./venues.json" with { type: "json" };

const seedDatabase = async () => {
  try {
    const invalidVenues = venues.filter(
      (venue) => !Number.isFinite(venue.capacity) || venue.capacity < 1,
    );

    if (invalidVenues.length > 0) {
      console.error("Cannot seed database. Invalid venue capacities:");
      invalidVenues.forEach((venue) => {
        console.error(`- ${venue.name}: ${venue.capacity}`);
      });
      process.exitCode = 1;
      return;
    }

    await connectDB();

    await seedVenues(venues);

    console.log(`${venues.length} venues seeded successfully.`);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
};

seedDatabase();
