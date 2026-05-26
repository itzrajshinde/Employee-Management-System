import nodemailer from "nodemailer"

const createTransporter = () => nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
})

const sendEmail = async ({ to, subject, body }) => {
    if (!to) {
        console.warn("sendEmail: no recipient address, skipping")
        return
    }
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("sendEmail: SMTP credentials not set, skipping")
        return
    }

    try {
        const transporter = createTransporter()
        const response = await transporter.sendMail({
            from: `"QuickEMS" <${process.env.SENDER_EMAIL}>`,
            to,
            subject,
            html: body,
        })
        console.log(`Email sent to ${to}: ${response.messageId}`)
        return response
    } catch (error) {
        console.error(`Email failed to ${to}:`, error.message)
        throw error
    }
}

export default sendEmail
