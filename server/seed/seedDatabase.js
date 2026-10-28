import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Venue from "../models/venue.js";
import venues from "./venues.json" with { type: "json" };

const seedDatabase = async () => {
    try {
        await connectDB();
        const invalidVenues = venues.filter( (venue) => !Number.isFinite(venue.capacity) || venue.capacity < 1 );

        if (invalidVenues.length > 0) {
            console.error("Cannot seed database. Invalid venue capacities:");
            invalidVenues.forEach((venue) => { console.error(`- ${venue.name}: ${venue.capacity}`); });
            return;
        }

        await Venue.insertMany(venues);

        console.log(`${venues.length} venues inserted successfully.`);
    } 
    catch (error) {
        console.error("Database seeding failed:", error.message);
    } 
    finally {
        await mongoose.disconnect();
        console.log("MongoDB connection closed.");
    }
};

seedDatabase();