import Employee from "../config/models/Employee.js"
import Payslip from "../config/models/PaySlips.js"

// POST /api/payslips
export const createPayslip = async (req, res) => {
    try {
        const { employeeId, month, year, basicSalary, allowances = 0, deductions = 0 } = req.body

        if (!employeeId || !month || !year || !basicSalary) {
            return res.status(400).json({ error: "employeeId, month, year and basicSalary are required" })
        }

        if (month < 1 || month > 12) {
            return res.status(400).json({ error: "month must be between 1 and 12" })
        }

        const employee = await Employee.findById(employeeId)
        if (!employee || employee.isDeleted) {
            return res.status(404).json({ error: "Employee not found" })
        }

        // Check duplicate payslip for same month/year
        const existing = await Payslip.findOne({ employeeId, month, year })
        if (existing) {
            return res.status(400).json({ error: "Payslip already exists for this month and year" })
        }

        const netSalary = basicSalary + allowances - deductions

        const payslip = await Payslip.create({
            employeeId, month, year, basicSalary, allowances, deductions, netSalary
        })

        res.status(201).json({ message: "Payslip created", payslip })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /api/payslips
export const getPayslips = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query

        const filter = {}
        if (employeeId) filter.employeeId = employeeId
        if (month)      filter.month = Number(month)
        if (year)       filter.year = Number(year)

        const payslips = await Payslip.find(filter)
            .populate("employeeId", "firstName lastName email department position")
            .sort({ year: -1, month: -1 })

        res.status(200).json({ payslips })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// GET /api/payslips/:id
export const getPayslipById = async (req, res) => {
    try {
        const { id } = req.params

        const payslip = await Payslip.findById(id)
            .populate("employeeId", "firstName lastName email department position")

        if (!payslip) return res.status(404).json({ error: "Payslip not found" })

        res.status(200).json({ payslip })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
