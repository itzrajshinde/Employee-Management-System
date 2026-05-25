import Employee from "../config/models/Employee.js"
import Attendance from "../config/models/Attendance.js"

// Compute working hours and determine day type
const computeWorkingDetails = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return { workingHours: null, dayType: null }

    const diffMs = new Date(checkOut) - new Date(checkIn)
    const workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))

    let dayType = null
    if (workingHours >= 8)       dayType = "Full Day"
    else if (workingHours >= 6)  dayType = "Three Quarter Day"
    else if (workingHours >= 4)  dayType = "Half Day"
    else                         dayType = "Short Day"

    return { workingHours, dayType }
}

// POST /api/attendance/clock-in
export const clockIn = async (req, res) => {
    try {
        const { employeeId } = req.body
        if (!employeeId) return res.status(400).json({ error: "employeeId is required" })

        const employee = await Employee.findById(employeeId)
        if (!employee || employee.isDeleted) {
            return res.status(404).json({ error: "Employee not found" })
        }

        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        // Check if already clocked in today
        const existing = await Attendance.findOne({ employeeId, date: startOfDay })
        if (existing) {
            return res.status(400).json({ error: "Already clocked in today" })
        }

        // Determine status: LATE if after 9:00 AM
        const nineAM = new Date(startOfDay)
        nineAM.setHours(9, 0, 0, 0)
        const status = now > nineAM ? "LATE" : "PRESENT"

        const attendance = await Attendance.create({
            employeeId,
            date: startOfDay,
            checkIn: now,
            status,
        })

        res.status(201).json({ message: "Clocked in successfully", attendance })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// POST /api/attendance/clock-out
export const clockOut = async (req, res) => {
    try {
        const { employeeId } = req.body
        if (!employeeId) return res.status(400).json({ error: "employeeId is required" })

        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        const attendance = await Attendance.findOne({ employeeId, date: startOfDay })
        if (!attendance) {
            return res.status(404).json({ error: "No clock-in record found for today" })
        }
        if (attendance.checkOut) {
            return res.status(400).json({ error: "Already clocked out today" })
        }

        const { workingHours, dayType } = computeWorkingDetails(attendance.checkIn, now)

        attendance.checkOut = now
        attendance.workingHours = workingHours
        attendance.dayType = dayType
        await attendance.save()

        res.status(200).json({ message: "Clocked out successfully", attendance })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /api/attendance/:employeeId
export const getAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params
        const { startDate, endDate } = req.query

        const employee = await Employee.findById(employeeId)
        if (!employee || employee.isDeleted) {
            return res.status(404).json({ error: "Employee not found" })
        }

        const filter = { employeeId }
        if (startDate || endDate) {
            filter.date = {}
            if (startDate) filter.date.$gte = new Date(startDate)
            if (endDate)   filter.date.$lte = new Date(endDate)
        }

        const records = await Attendance.find(filter).sort({ date: -1 })
        res.status(200).json({ attendance: records })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
