import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "..", ".env");

dotenv.config({ path: rootEnvPath });

console.log("Loaded env from:", rootEnvPath);
console.log("SMTP_HOST:", process.env.SMTP_HOST || "missing");
console.log("SMTP_USER:", process.env.SMTP_USER || "missing");
console.log("CONTACT_RECEIVER_EMAIL:", process.env.CONTACT_RECEIVER_EMAIL || "missing");

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body || {};

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim();
    const cleanMessage = String(message).trim();

    if (!cleanName || !cleanEmail || !cleanMessage) {
        return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: "Invalid email address." });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Landing Pages Contact" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_RECEIVER_EMAIL,
            replyTo: cleanEmail,
            subject: `New contact form message from ${cleanName}`,
            text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
            html: `
        <h2>New message from your landing pages contact form</h2>
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${cleanMessage.replace(/\n/g, "<br/>")}</p>
      `,
        });

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully."
        });
    } catch (error) {
        console.error("Contact form email error:", error);
        return res.status(500).json({ error: "Failed to send message. Please try again later." });
    }
});

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const port = Number(process.env.PORT) || 5000;
    app.listen(port, () => {
        console.log(`Contact API running on http://localhost:${port}`);
        console.log("Injected env vars:", {
            SMTP_HOST: !!process.env.SMTP_HOST,
            SMTP_PORT: !!process.env.SMTP_PORT,
            SMTP_USER: !!process.env.SMTP_USER,
            SMTP_PASS: !!process.env.SMTP_PASS,
            CONTACT_RECEIVER_EMAIL: !!process.env.CONTACT_RECEIVER_EMAIL,
        });
    });
}

export default app;