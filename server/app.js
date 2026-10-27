import express from "express"
import cors from "cors"

import authRoutes from "./routes/authRoute"
import venueRoutes from "./routes/venueRoutes"
import bookingRoutes from "./routes/bookingRoutes"
import approvalRoutes from "./routes/approvalRoutes"
import adminRoutes from "./routes/adminRoutes.js"

import {notFound, errorHandler} from "./middleware/errorHandler"

const app=express()

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
}))

app.use(express.json())

app.get("/api/health",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"COEP spaces API  is running"
    })
})

app.use("/api/auth",authRoutes);
app.use("/api/venues",venueRoutes)
app.use("/api/bookings",approvalRoutes)
app.use("/api/approvals",approvalRoutes)
app.use("/api/admin",adminRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
