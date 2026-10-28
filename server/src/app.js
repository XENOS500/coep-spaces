import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import venueRoutes from "./routes/venueRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import approvalRoutes from "./routes/approvalRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "COEP spaces API  is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
