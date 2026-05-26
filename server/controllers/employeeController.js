import bcrypt from "bcrypt"
import Employee from "../config/models/Employee.js"
import User from "../config/models/user.js"

const SALT_ROUNDS = 10

// Get employees
// GET /api/employees
export const getEmployees = async (req, res) => {
    try {
        const { department } = req.query
        const where = {}
        if (department) where.department = department

        const employees = await Employee.find(where)
            .sort({ createdAt: -1 })
            .populate("userId", "email role")
            .lean()

        const result = employees.map((emp) => ({
            ...emp,
            id: emp._id.toString(),
            user: emp.userId ? { email: emp.userId.email, role: emp.userId.role } : null,
        }))

        return res.json(result)
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch employees" })
    }
}

// Create employee + user account
// POST /api/employees
export const createEmployee = async (req, res) => {
    try {
        const {
            firstName, lastName, email, phone, position,
            department, basicSalary, allowances, deductions,
            joinDate, role = "EMPLOYEE",
            workEmail, password,
        } = req.body

        // Check if user account already exists
        const existing = await User.findOne({ email: workEmail })
        if (existing) {
            return res.status(400).json({ error: "An account with this work email already exists" })
        }

        // Hash password with bcrypt salt rounds 10
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        // Create user account
        const user = await User.create({
            email: workEmail,
            password: hashedPassword,
            role,
        })

        // Create employee linked to user
        const employee = await Employee.create({
            userId: user._id,
            firstName,
            lastName,
            email,
            phone,
            position,
            department,
            basicSalary: basicSalary || 0,
            allowances: allowances || 0,
            deductions: deductions || 0,
            joinDate: joinDate || new Date(),
        })

        return res.status(201).json({
            employee,
            user: { email: user.email, role: user.role },
        })
    } catch (error) {
        return res.status(500).json({ error: "Failed to create employee" })
    }
}

// Update employee
// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params
        const { password, ...updates } = req.body

        // If password is being updated, hash it
        if (password) {
            const employee = await Employee.findById(id)
            if (employee?.userId) {
                const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
                await User.findByIdAndUpdate(employee.userId, { password: hashedPassword })
            }
        }

        const employee = await Employee.findByIdAndUpdate(id, updates, { new: true })
        if (!employee) return res.status(404).json({ error: "Employee not found" })

        return res.json(employee)
    } catch (error) {
        return res.status(500).json({ error: "Failed to update employee" })
    }
}

// Delete employee (soft delete)
// DELETE /api/employees/:id
export const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params

        const employee = await Employee.findByIdAndUpdate(id, { isDeleted: true }, { new: true })
        if (!employee) return res.status(404).json({ error: "Employee not found" })

        return res.json({ message: "Employee deleted successfully" })
    } catch (error) {
        return res.status(500).json({ error: "Failed to delete employee" })
    }
}
