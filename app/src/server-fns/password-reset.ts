import crypto from "node:crypto"
import { createServerFn } from "@tanstack/react-start"
import { and, eq, gt } from "drizzle-orm"
import { db } from "../server/db.js"
import { passwordResetTokens } from "../server/schema.js"
import { generateId } from "../server/id.js"
import { sshaHash } from "../server/password.js"
import { usersApi } from "../server/users-api.js"
import { sendMail } from "../server/mail.js"
import { env } from "../server/env.js"
import { tracingMiddleware } from "../server/tracing.js"

export const requestPasswordReset = createServerFn({
  method: "POST",
})
  .middleware([tracingMiddleware])
  .inputValidator((input: { email: string }) => input)
  .handler(async ({ data }) => {
    if (!data.email) {
      throw new Error("E-postadresse må oppgis.")
    }

    // Rate limit: check for recent token
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const [recentToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.email, data.email),
          gt(passwordResetTokens.createdAt, fiveMinutesAgo),
        ),
      )
      .limit(1)

    if (recentToken) {
      const retryAfter = Math.max(
        1,
        Math.ceil(
          (recentToken.createdAt.getTime() + 5 * 60 * 1000 - Date.now()) / 1000,
        ),
      )
      throw new Error(
        `Vennligst vent ${retryAfter} sekunder før du prøver igjen.`,
      )
    }

    // Look up user by email
    const users = await usersApi.getUsers()
    const user = users.find(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase(),
    )

    if (!user) {
      throw new Error("Ingen bruker med denne e-postadressen ble funnet.")
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

    await db.insert(passwordResetTokens).values({
      id: generateId(),
      tokenHash,
      username: user.username,
      email: data.email,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    })

    // Send email
    const resetUrl = `${env.appUrl}/intern/reset-password?token=${encodeURIComponent(token)}`

    await sendMail({
      to: data.email,
      subject: "Tilbakestill passord - foreningsbruker",
      text: [
        `Hei ${user.realname ?? user.username} (${user.username})!`,
        "",
        "Du har bedt om tilbakestilling av passord for din foreningsbruker.",
        "",
        "Klikk på lenken under for å sette nytt passord:",
        resetUrl,
        "",
        "Lenken er gyldig i 1 time.",
        "",
        "Hvis du ikke har bedt om dette, kan du se bort fra denne e-posten.",
      ].join("\n"),
    })

    return {
      messages: [
        {
          type: "success",
          message:
            "En lenke for å tilbakestille passordet er sendt til din e-postadresse.",
        },
      ],
    }
  })

export const validateResetToken = createServerFn({
  method: "POST",
})
  .middleware([tracingMiddleware])
  .inputValidator((input: { token: string }) => input)
  .handler(async ({ data }) => {
    if (!data.token) throw new Error("Token må oppgis.")
    await findValidToken(data.token)
    return { valid: true }
  })

export const resetPassword = createServerFn({
  method: "POST",
})
  .middleware([tracingMiddleware])
  .inputValidator((input: { token: string; password: string }) => input)
  .handler(async ({ data }) => {
    if (!data.token || !data.password) {
      throw new Error("Token og passord må oppgis.")
    }

    if (data.password.length < 8) {
      throw new Error("Passordet må være på minst 8 tegn.")
    }

    const resetToken = await findValidToken(data.token)

    // Hash password and update via users-api
    const passwordHash = sshaHash(data.password)
    await usersApi.modifyUser(resetToken.username, {
      passwordHash: { value: passwordHash },
    })

    // Invalidate all tokens for this user
    await db
      .update(passwordResetTokens)
      .set({ used: true, updatedAt: new Date() })
      .where(
        and(
          eq(passwordResetTokens.username, resetToken.username),
          eq(passwordResetTokens.used, false),
        ),
      )

    return {
      messages: [
        {
          type: "success",
          message: "Passordet er oppdatert. Du kan nå logge inn.",
        },
      ],
    }
  })

async function findValidToken(token: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

  const [resetToken] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1)

  if (!resetToken) {
    throw new Error("Ugyldig eller utløpt lenke.")
  }

  if (resetToken.used) {
    throw new Error("Denne lenken er allerede brukt.")
  }

  if (resetToken.expiresAt < new Date()) {
    throw new Error("Lenken har utløpt. Vennligst be om en ny.")
  }

  return resetToken
}
