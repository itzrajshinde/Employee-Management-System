import Employee from "../config/models/Employee.js"
import LeaveApplication from "../config/models/LeaveApplication.js"

// POST /api/leaves
export const createLeave = async (req, res) => {
    try {
        const { employeeId, type, startDate, endDate, reason } = req.body

        if (!employeeId || !type || !startDate || !endDate || !reason) {
            return res.status(400).json({ error: "All fields are required" })
        }

        const employee = await Employee.findById(employeeId)
        if (!employee || employee.isDeleted) {
            return res.status(404).json({ error: "Employee not found" })
        }

        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: "startDate cannot be after endDate" })
        }

        const leave = await LeaveApplication.create({ employeeId, type, startDate, endDate, reason })
        res.status(201).json({ message: "Leave application submitted", leave })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /api/leaves
export const getLeaves = async (req, res) => {
    try {
        const { employeeId, status } = req.query

        const filter = {}
        if (employeeId) filter.employeeId = employeeId
        if (status)     filter.status = status

        const leaves = await LeaveApplication.find(filter)
            .populate("employeeId", "firstName lastName email department")
            .sort({ createdAt: -1 })

        res.status(200).json({ leaves })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// PATCH /api/leaves/:id
export const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
            return res.status(400).json({ error: "Invalid status value" })
        }

        const leave = await LeaveApplication.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate("employeeId", "firstName lastName email department")

        if (!leave) return res.status(404).json({ error: "Leave application not found" })

        res.status(200).json({ message: "Leave status updated", leave })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
