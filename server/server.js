require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const app = express();
const Venue = require("./models/venue");

app.use(express.json());

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();