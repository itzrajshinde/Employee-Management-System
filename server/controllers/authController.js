import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../config/models/user.js"

const SALT_ROUNDS = 10

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password, role_type } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        if (role_type === "admin" && user.role !== "ADMIN") {
            return res.status(401).json({ error: "Not authorized as admin" })
        }

        if (role_type === "employee" && user.role !== "EMPLOYEE") {
            return res.status(401).json({ error: "Not authorized as employee" })
        }

        // Compare submitted password against hashed password in DB
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        const payload = {
            userId: user._id.toString(),
            role: user.role,
            email: user.email,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" })

        return res.json({ user: payload, token })
    } catch (error) {
        console.error("Login error:", error)
        return res.status(500).json({ error: "Login failed" })
    }
}

// GET /api/auth/session
export const session = (req, res) => {
    return res.json({ user: req.user || null })
}

// POST /api/auth/change-password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Both passwords are required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "New password must be at least 6 characters" })
        }

        const userId = req.user?.userId
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        // Compare current password against stored hash
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return res.status(401).json({ error: "Current password is incorrect" })
        }

        // Hash new password and save
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
        user.password = hashedPassword
        await user.save()

        return res.json({ message: "Password changed successfully" })
    } catch (error) {
        console.error("Change password error:", error)
        return res.status(500).json({ error: "Failed to change password" })
    }
}
