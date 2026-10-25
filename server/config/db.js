const dns = require("dns");
dns.setServers(["8.8.8.8"]);

const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected:", conn.connection.host);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        console.error("Error details:", error.cause);
        console.error("Underlying error:", error.reason?.servers);
        process.exit(1);
    }
};

module.exports = connectDB;