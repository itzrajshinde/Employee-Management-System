import Employee from "../config/models/Employee.js"
import User from "../config/models/user.js"

// GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const { userId, role } = req.user

        // Admin — return user account info (no employee record)
        if (role === "ADMIN") {
            const user = await User.findById(userId).select("-password").lean()
            if (!user) return res.status(404).json({ error: "User not found" })
            return res.json({ role: "ADMIN", profile: user })
        }

        // Employee — find employee record linked to this user
        const employee = await Employee.findOne({ userId, isDeleted: false })
            .populate("userId", "email role")
            .lean()

        if (!employee) return res.status(404).json({ error: "Employee profile not found" })

        return res.json({
            role: "EMPLOYEE",
            profile: {
                ...employee,
                id: employee._id.toString(),
                email: employee.userId?.email,
            },
        })
    } catch (error) {
        console.error("Get profile error:", error)
        return res.status(500).json({ error: "Failed to fetch profile" })
    }
}

// PUT /api/profile
export const updateProfile = async (req, res) => {
    try {
        const { userId, role } = req.user

        // Admin — update user record only
        if (role === "ADMIN") {
            const { email } = req.body
            const user = await User.findByIdAndUpdate(
                userId,
                { email },
                { new: true }
            ).select("-password")

            if (!user) return res.status(404).json({ error: "User not found" })
            return res.json({ role: "ADMIN", profile: user })
        }

        // Employee — update employee record
        const allowedFields = ["firstName", "lastName", "phone", "position", "department", "bio", "image"]
        const updates = {}
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) updates[field] = req.body[field]
        }

        const employee = await Employee.findOneAndUpdate(
            { userId, isDeleted: false },
            updates,
            { new: true }
        ).populate("userId", "email role").lean()

        if (!employee) return res.status(404).json({ error: "Employee profile not found" })

        return res.json({
            role: "EMPLOYEE",
            profile: {
                ...employee,
                id: employee._id.toString(),
                email: employee.userId?.email,
            },
        })
    } catch (error) {
        console.error("Update profile error:", error)
        return res.status(500).json({ error: "Failed to update profile" })
    }
}
