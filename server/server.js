import express from "express"
import cors from "cors"
import "dotenv/config"
import multer from "multer"
import connectDB from "./config/db.js"
import authRouter from "./Routes/authRoutes.js"
import employeesRouter from "./Routes/employeeRoute.js"
import profileRouter from "./Routes/profileRoute.js"
import attendanceRouter from "./Routes/attendanceRoutes.js"
import leaveRouter from "./Routes/leaveRoutes.js"
import payslipRouter from "./Routes/payslipRoutes.js"
import dashboardRouter from "./Routes/dashboardRoutes.js"

import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"




const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json())
app.use(multer().none())

// Routes
app.get("/", (_req, res) => res.send("Server is running"))
app.use("/api/auth", authRouter)
app.use("/api/employees", employeesRouter)
app.use("/api/profile", profileRouter)
app.use("/api/attendance", attendanceRouter)
app.use("/api/leaves", leaveRouter)
app.use("/api/payslips", payslipRouter)
app.use("/api/dashboard", dashboardRouter)

app.use("/api/inngest", serve({ client: inngest, functions }));

// Connect DB then start server
const start = async () => {
    await connectDB()
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start()
