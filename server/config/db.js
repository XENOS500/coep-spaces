import dns from "node:dns";
import mongoose from "mongoose";
import "dotenv/config";

dns.setServers(["8.8.8.8"]);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected:", conn.connection.host);
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;