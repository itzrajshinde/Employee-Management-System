import { Router } from "express"
import { protect, protectAdmin } from "../middleware/auth.js"
import { clockIn, clockOut, getAttendance, getAllAttendance } from "../controllers/attendanceController.js"

const attendanceRouter = Router()

attendanceRouter.post("/clock-in",  protect, clockIn)
attendanceRouter.post("/clock-out", protect, clockOut)
attendanceRouter.get("/all",        protect, protectAdmin, getAllAttendance)
attendanceRouter.get("/:employeeId", protect, getAttendance)

export default attendanceRouter
