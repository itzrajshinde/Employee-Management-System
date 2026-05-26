import mongoose from "mongoose"

let isConnected = false

const connectDB = async () => {
    if (isConnected) return

    try {
        await mongoose.connect(process.env.MONGODB_URI)
        isConnected = true
        console.log("Database connected")
    } catch (error) {
        console.error("Database connection failed:", error.message)
        throw error
    }
}

export default connectDB
