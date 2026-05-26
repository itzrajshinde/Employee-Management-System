import Employee from "../config/models/Employee.js"
import Attendance from "../config/models/Attendance.js"
import Payslip from "../config/models/PaySlips.js"
import LeaveApplication from "../config/models/LeaveApplication.js"
import { DEPARTMENTS } from "../constants/department.js"

// GET /api/dashboard
export const getDashboard = async (req, res) => {
    try {
        const { role, userId } = req.user

        if (role === "ADMIN") {
            return getAdminDashboard(res)
        }

        // Find employee linked to this user
        const employee = await Employee.findOne({ userId, isDeleted: false })
        if (!employee) return res.status(404).json({ error: "Employee profile not found" })

        return getEmployeeDashboard(res, employee)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// --- Admin Dashboard ---
const getAdminDashboard = async (res) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
        totalEmployees,
        activeEmployees,
        todayAttendance,
        monthlyLeaves,
        pendingLeaves,
        departmentBreakdown,
        recentAttendance,
        leaveStatusSummary,
    ] = await Promise.all([
        // Total employees
        Employee.countDocuments({ isDeleted: false }),

        // Active employees
        Employee.countDocuments({ isDeleted: false, employmentStatus: "ACTIVE" }),

        // Today's attendance count
        Attendance.countDocuments({ date: startOfDay, status: { $in: ["PRESENT", "LATE"] } }),

        // Leaves applied this month
        LeaveApplication.countDocuments({ createdAt: { $gte: startOfMonth } }),

        // Pending leave approvals
        LeaveApplication.countDocuments({ status: "PENDING" }),

        // Employees per department
        Employee.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),

        // Recent attendance (last 7 days)
        Attendance.find({ date: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } })
            .populate("employeeId", "firstName lastName department")
            .sort({ date: -1 })
            .limit(10),

        // Leave status breakdown
        LeaveApplication.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
    ])

    // Fill in departments with 0 if not present
    const deptMap = Object.fromEntries(departmentBreakdown.map(d => [d._id, d.count]))
    const departments = DEPARTMENTS.map(name => ({ name, count: deptMap[name] || 0 }))

    const leaveStatus = { PENDING: 0, APPROVED: 0, REJECTED: 0 }
    leaveStatusSummary.forEach(l => { leaveStatus[l._id] = l.count })

    res.status(200).json({
        role: "ADMIN",
        summary: {
            totalEmployees,
            activeEmployees,
            todayAttendance,
            monthlyLeaves,
            pendingLeaves,
        },
        departments,
        leaveStatus,
        recentAttendance,
    })
}

// --- Employee Dashboard ---
const getEmployeeDashboard = async (res, employee) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
        todayAttendance,
        monthlyAttendance,
        leaveApplications,
        recentPayslips,
    ] = await Promise.all([
        // Today's clock-in record
        Attendance.findOne({ employeeId: employee._id, date: startOfDay }),

        // This month's attendance
        Attendance.find({
            employeeId: employee._id,
            date: { $gte: startOfMonth, $lte: endOfMonth },
        }).sort({ date: -1 }),

        // All leave applications
        LeaveApplication.find({ employeeId: employee._id }).sort({ createdAt: -1 }).limit(5),

        // Recent payslips
        Payslip.find({ employeeId: employee._id }).sort({ year: -1, month: -1 }).limit(3),
    ])

    // Compute monthly stats
    const presentDays  = monthlyAttendance.filter(a => a.status === "PRESENT").length
    const lateDays     = monthlyAttendance.filter(a => a.status === "LATE").length
    const totalHours   = monthlyAttendance.reduce((sum, a) => sum + (a.workingHours || 0), 0)

    res.status(200).json({
        role: "EMPLOYEE",
        employee: {
            id: employee._id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            department: employee.department,
        },
        todayAttendance,
        monthlyStats: {
            presentDays,
            lateDays,
            absentDays: monthlyAttendance.filter(a => a.status === "ABSENT").length,
            totalWorkingHours: parseFloat(totalHours.toFixed(2)),
        },
        leaveApplications,
        recentPayslips,
    })
}
