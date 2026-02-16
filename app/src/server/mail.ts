import { createTransport } from "nodemailer"
import { env } from "./env.js"

const transporter = createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
})

interface MailOptions {
  to: string
  subject: string
  text: string
  from?: string
  replyTo?: string
}

export async function sendMail(options: MailOptions): Promise<void> {
  await transporter.sendMail({
    from: options.from ?? "it-gruppa@foreningenbs.no",
    to: options.to,
    subject: options.subject,
    text: options.text,
    replyTo: options.replyTo,
  })
}
