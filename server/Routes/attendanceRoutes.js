import { Router } from "express"
import { protect } from "../middleware/auth.js"
import { clockIn, clockOut, getAttendance } from "../controllers/attendanceController.js"

const attendanceRouter = Router()

attendanceRouter.post("/clock-in",  protect, clockIn)
attendanceRouter.post("/clock-out", protect, clockOut)
attendanceRouter.get("/:employeeId", protect, getAttendance)

export default attendanceRouter
