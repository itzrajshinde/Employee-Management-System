import "dotenv/config"
import bcrypt from "bcrypt"
import connectDB from "./config/db.js"
import User from "./config/models/user.js"

const TemporaryPassword = "admin123"

async function registerAdmin() {
    try {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL

        if (!ADMIN_EMAIL) {
            console.error("Missing ADMIN_EMAIL in .env")
            process.exit(1)
        }

        await connectDB()

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
        if (existingAdmin) {
            console.log("Admin already exists with role:", existingAdmin.role)
            process.exit(0)
        }

        const hashedPassword = await bcrypt.hash(TemporaryPassword, 10)

        const admin = await User.create({
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: "ADMIN",
        })

        console.log("Admin user created successfully")
        console.log("\nemail:", admin.email)
        console.log("password:", TemporaryPassword)
        console.log("\nChange the password after login.")
        process.exit(0)
    } catch (error) {
        console.error("Seed failed:", error.message)
        process.exit(1)
    }
}

registerAdmin()
