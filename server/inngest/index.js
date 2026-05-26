import { Inngest } from "inngest"
import sendEmail from "../config/nodemailer.js"
import Attendance from "../config/models/Attendance.js"
import Employee from "../config/models/Employee.js"
import LeaveApplication from "../config/models/LeaveApplication.js"

export const inngest = new Inngest({ id: "fullstack-ems" })

// ─── Function 1: Auto check-out + reminder after 10 hours ────────────────────
// Trigger: inngest.send({ name: "employee/check-in", data: { attendanceId, email, firstName, department, checkIn } })
const autoCheckOut = inngest.createFunction(
    { id: "auto-check-out", triggers: [{ event: "employee/check-in" }] },
    async ({ event, step }) => {
        const { attendanceId, email, firstName, department, checkIn } = event.data

        // Wait 9 hours then send reminder
        await step.sleepUntil("wait-9-hours", new Date(new Date(checkIn).getTime() + 9 * 60 * 60 * 1000))

        await step.run("send-checkout-reminder", async () => {
            await sendEmail({
                to: email,
                subject: "Reminder: Please check out",
                body: `
                    <div style="max-width:600px;">
                        <h2>Hi ${firstName}, 👋</h2>
                        <p style="font-size:16px;">You checked in at <strong>${department}</strong> today:</p>
                        <p style="font-size:18px;font-weight:bold;color:#007bff;">${new Date(checkIn).toLocaleTimeString()}</p>
                        <p style="font-size:16px;">Please make sure to check out within the next hour.</p>
                        <p style="font-size:16px;">If you have any questions, please contact your admin.</p>
                        <br/>
                        <p>Best Regards,<br/><strong>EMS</strong></p>
                    </div>`,
            })
        })

        // Wait 1 more hour (10 hours total) then auto check-out if still not done
        await step.sleepUntil("wait-1-more-hour", new Date(new Date(checkIn).getTime() + 10 * 60 * 60 * 1000))

        await step.run("auto-checkout-if-missed", async () => {
            const record = await Attendance.findById(attendanceId)
            if (!record || record.checkOut) return

            const checkOut = new Date()
            const diffMs = checkOut - new Date(record.checkIn)
            const workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2))

            let dayType = "Short Day"
            if (workingHours >= 8)      dayType = "Full Day"
            else if (workingHours >= 6) dayType = "Three Quarter Day"
            else if (workingHours >= 4) dayType = "Half Day"

            record.checkOut = checkOut
            record.status = "LATE"
            record.workingHours = workingHours
            record.dayType = dayType
            await record.save()
        })
    }
)

// ─── Function 2: Remind admin if leave not actioned within 24 hours ──────────
// Trigger: inngest.send({ name: "leave/submitted", data: { leaveId, department, startDate } })
const leaveActionReminder = inngest.createFunction(
    { id: "leave-action-reminder", triggers: [{ event: "leave/submitted" }] },
    async ({ event, step }) => {
        const { leaveId, department, startDate } = event.data

        await step.sleep("wait-24-hours", 24 * 60 * 60 * 1000)

        await step.run("check-and-notify-admin", async () => {
            const leave = await LeaveApplication.findById(leaveId)
            if (!leave || leave.status !== "PENDING") return

            await sendEmail({
                to: process.env.ADMIN_EMAIL,
                subject: "Action Required: Pending Leave Application",
                body: `
                    <div style="max-width:600px;">
                        <h2>Hi Admin, 👋</h2>
                        <p style="font-size:16px;">You have a pending leave application in <strong>${department}</strong>:</p>
                        <p style="font-size:18px;font-weight:bold;color:#007bff;">${new Date(startDate).toLocaleDateString()}</p>
                        <p style="font-size:16px;">Please take action on this leave application.</p>
                        <br/>
                        <p>Best Regards,<br/><strong>EMS</strong></p>
                    </div>`,
            })
        })
    }
)

// ─── Function 3: Daily attendance reminder for absent employees ───────────────
// Cron: every day at 11:30 AM UTC
const dailyAttendanceReminder = inngest.createFunction(
    { id: "daily-attendance-reminder", triggers: [{ cron: "30 11 * * *" }] },
    async ({ step }) => {
        const today = new Date()
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        // Step 1: Get all active non-deleted employees
        const allEmployees = await step.run("get-active-employees", async () => {
            return Employee.find({ isDeleted: false, employmentStatus: "ACTIVE" }).lean()
        })

        // Step 2: Get employee IDs on approved leave today
        const onLeaveIds = await step.run("get-employees-on-leave", async () => {
            const leaves = await LeaveApplication.find({
                status: "APPROVED",
                startDate: { $lte: today },
                endDate:   { $gte: startOfDay },
            }).lean()
            return leaves.map(l => l.employeeId.toString())
        })

        // Step 3: Get employee IDs who already checked in today
        const checkedInIds = await step.run("get-checked-in-employees", async () => {
            const records = await Attendance.find({ date: startOfDay }).lean()
            return records.map(r => r.employeeId.toString())
        })

        // Step 4: Filter absent employees — not on leave and not checked in
        const absentEmployees = allEmployees.filter(emp => {
            const id = emp._id.toString()
            return !onLeaveIds.includes(id) && !checkedInIds.includes(id)
        })

        // Step 5: Send reminder emails to absent employees
        await step.run("send-reminder-emails", async () => {
            const emailPromises = absentEmployees.map(emp =>
                sendEmail({
                    to: emp.email,
                    subject: "Reminder: Mark Your Attendance",
                    body: `
                        <div style="max-width:600px;font-family:Arial,sans-serif;">
                            <h2>Hi ${emp.firstName}, 👋</h2>
                            <p style="font-size:16px;">We noticed you haven't marked your attendance yet today.</p>
                            <p style="font-size:16px;">The deadline was <strong>11:30 AM</strong> and your attendance is still missing.</p>
                            <p style="font-size:16px;">Please check in as soon as possible or contact your admin if you're facing any issues.</p>
                            <br/>
                            <p style="font-size:14px;color:#666;">Department: ${emp.department}</p>
                            <br/>
                            <p>Best Regards,<br/><strong>QuickEMS</strong></p>
                        </div>`,
                })
            )
            await Promise.allSettled(emailPromises)
        })

        return { reminded: absentEmployees.length }
    }
)

// ─── Export all inngest functions ─────────────────────────────────────────────
export const functions = [autoCheckOut, leaveActionReminder, dailyAttendanceReminder]
