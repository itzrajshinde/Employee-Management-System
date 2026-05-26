import Employee from "../config/models/Employee.js"
import Attendance from "../config/models/Attendance.js"
import { inngest } from "../inngest/index.js"
import sendEmail from "../config/nodemailer.js"

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

        const existing = await Attendance.findOne({ employeeId, date: startOfDay })
        if (existing) {
            return res.status(400).json({ error: "Already clocked in today" })
        }

        const nineAM = new Date(startOfDay)
        nineAM.setHours(9, 0, 0, 0)
        const status = now > nineAM ? "LATE" : "PRESENT"

        const attendance = await Attendance.create({
            employeeId,
            date: startOfDay,
            checkIn: now,
            status,
        })

        // Send clock-in confirmation email
        const emailTo = employee.email || null
        if (emailTo) {
            sendEmail({
                to: emailTo,
                subject: "Clock-In Confirmation",
                body: `
                    <div style="max-width:600px;font-family:Arial,sans-serif;">
                        <h2>Hi ${employee.firstName}, 👋</h2>
                        <p style="font-size:16px;">You have successfully clocked in today.</p>
                        <p style="font-size:18px;font-weight:bold;color:#4f46e5;">
                            ${now.toLocaleTimeString()} — ${now.toLocaleDateString()}
                        </p>
                        ${status === "LATE" ? `<p style="color:#d97706;font-size:14px;">⚠️ You clocked in late today.</p>` : ""}
                        <p style="font-size:14px;color:#666;">Department: ${employee.department}</p>
                        <br/>
                        <p>Best Regards,<br/><strong>QuickEMS</strong></p>
                    </div>`,
            }).catch(console.error) // non-blocking
        }

        // Fire inngest event for auto check-out reminder after 9 hours
        inngest.send({
            name: "employee/check-in",
            data: {
                attendanceId: attendance._id.toString(),
                employeeId:   employee._id.toString(),
                email:        emailTo,
                firstName:    employee.firstName,
                department:   employee.department,
                checkIn:      now.toISOString(),
            },
        }).catch(console.error) // non-blocking

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

        const employee = await Employee.findById(employeeId)
        if (!employee || employee.isDeleted) {
            return res.status(404).json({ error: "Employee not found" })
        }

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

        // Send clock-out confirmation email
        const emailTo = employee.email || null
        if (emailTo) {
            sendEmail({
                to: emailTo,
                subject: "Clock-Out Confirmation",
                body: `
                    <div style="max-width:600px;font-family:Arial,sans-serif;">
                        <h2>Hi ${employee.firstName}, 👋</h2>
                        <p style="font-size:16px;">You have successfully clocked out today.</p>
                        <p style="font-size:18px;font-weight:bold;color:#4f46e5;">
                            ${now.toLocaleTimeString()} — ${now.toLocaleDateString()}
                        </p>
                        <p style="font-size:16px;">
                            Total working hours: <strong>${workingHours}h</strong> (${dayType})
                        </p>
                        <p style="font-size:14px;color:#666;">Department: ${employee.department}</p>
                        <br/>
                        <p>Best Regards,<br/><strong>QuickEMS</strong></p>
                    </div>`,
            }).catch(console.error) // non-blocking
        }

        res.status(200).json({ message: "Clocked out successfully", attendance })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /api/attendance/all  (admin)
export const getAllAttendance = async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query

        const filter = {}
        if (date) {
            const d = new Date(date)
            filter.date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
        } else if (startDate || endDate) {
            filter.date = {}
            if (startDate) filter.date.$gte = new Date(startDate)
            if (endDate)   filter.date.$lte = new Date(endDate)
        }

        const records = await Attendance.find(filter)
            .populate("employeeId", "firstName lastName department position")
            .sort({ date: -1 })
            .limit(100)

        res.status(200).json({ attendance: records })
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
