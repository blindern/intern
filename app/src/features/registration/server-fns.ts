import { AppError } from "../../server/errors.js"

import { createServerFn } from "@tanstack/react-start"
import { and, desc, eq } from "drizzle-orm"
import { getRequest } from "@tanstack/react-start/server"
import { db } from "../../server/db.js"
import { registrationRequests } from "../../server/schema.js"
import { generateId } from "../../server/id.js"
import { authMiddleware, isUserAdmin } from "../../server/auth.js"
import { tracingMiddleware } from "../../server/tracing.js"
import { sshaHash } from "../../server/password.js"
import { usersApi } from "../../server/users-api.js"
import { sendMail } from "../../server/mail.js"
import { env } from "../../server/env.js"
import { logger } from "../../server/logger.js"

const log = logger.child({ module: "registration" })

export const submitRegistration = createServerFn({
  method: "POST",
})
  .middleware([tracingMiddleware])
  .inputValidator(
    (input: {
      firstname: string
      lastname: string
      username: string
      email: string
      password: string
      phone?: string | null
    }) => input,
  )
  .handler(async ({ data }) => {
    // Validate
    if (
      !data.firstname ||
      !data.lastname ||
      !data.username ||
      !data.email ||
      !data.password
    ) {
      throw new AppError("Data missing.")
    }

    const username = data.username.toLowerCase()

    if (
      username.length < 4 ||
      username.length > 20 ||
      !/^[a-z][a-z0-9]+$/.test(username)
    ) {
      throw new AppError("Brukernavn må være mellom 4 og 20 tegn (a-z, 0-9)")
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new AppError("Du må oppgi en korrekt e-postadresse")
    }

    if (data.password.length < 8) {
      throw new AppError("Passordet må være på minst 8 tegn")
    }

    if (data.phone && !/^\d{8}$/.test(data.phone)) {
      throw new AppError("Kun norske nummer med 8 tall kan registreres")
    }

    const passwordHash = sshaHash(data.password)
    const phone = data.phone ?? null

    // Check uniqueness against LDAP
    const existingUser = await usersApi.getUser(username)
    if (existingUser) {
      throw new AppError("Brukernavnet er allerede i bruk.")
    }

    // Check pending requests
    const [pendingUsername] = await db
      .select({ id: registrationRequests.id })
      .from(registrationRequests)
      .where(
        and(
          eq(registrationRequests.username, username),
          eq(registrationRequests.status, "pending"),
        ),
      )
      .limit(1)

    if (pendingUsername) {
      throw new AppError("Brukernavnet er allerede i bruk.")
    }

    // Check email uniqueness against LDAP
    const allUsers = await usersApi.getUsers()
    const emailTaken = allUsers.some(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase(),
    )
    if (emailTaken) {
      throw new AppError(
        "E-postadressen er allerede registrert. Bruk glemt passord for å tilbakestille passordet.",
      )
    }

    // Check email uniqueness in pending requests
    const [pendingEmail] = await db
      .select({ id: registrationRequests.id })
      .from(registrationRequests)
      .where(
        and(
          eq(registrationRequests.email, data.email),
          eq(registrationRequests.status, "pending"),
        ),
      )
      .limit(1)

    if (pendingEmail) {
      throw new AppError(
        "Det finnes allerede en ventende forespørsel med denne e-postadressen.",
      )
    }

    const request = getRequest()
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? null
    const userAgent = request.headers.get("user-agent") ?? null

    await db.insert(registrationRequests).values({
      id: generateId(),
      username,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      phone,
      passwordHash,
      status: "pending",
      ipAddress: ip,
      userAgent,
    })

    log.info(
      { username, email: data.email, ip },
      "registration request submitted",
    )

    // Send notification to IT-gruppa
    try {
      await sendMail({
        to: env.registeruserNotifyEmail,
        subject: `Foreningsbruker - ${username}`,
        replyTo: data.email.replace(/\s/g, ""),
        text: [
          "Ønsker opprettelse av foreningsbruker:",
          "",
          "",
          "Info til IT-gruppa:",
          "",
          `Fornavn: "${data.firstname}"`,
          `Etternavn: "${data.lastname}"`,
          `E-post: "${data.email}"`,
          `Ønsket brukernavn: "${username}"`,
          `Mobilnr: ${phone ? `"${phone}"` : "ikke registrert"}`,
          "",
          "",
          "Godkjenn eller avvis forespørselen:",
          `${env.appUrl}/intern/users/registrations`,
          "",
          "",
          "Informasjon for foreningsbrukeroppmann: https://foreningenbs.no/confluence/display/IT/LDAP",
        ].join("\n"),
      })
    } catch (err) {
      log.error(
        { username, email: data.email, err },
        "failed to send registration notification email",
      )
    }

    return {
      messages: [
        {
          type: "success",
          message:
            "Din forespørsel er nå sendt. Du får svar på e-post når brukeren er registrert.",
        },
      ],
    }
  })

export const getRegistrationRequests = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .inputValidator((input: { status?: string }) => input)
  .handler(async ({ data, context }) => {
    if (!isUserAdmin(context.user)) {
      throw new AppError("Forbidden")
    }

    const status = data.status ?? "pending"
    const query = db
      .select()
      .from(registrationRequests)
      .orderBy(desc(registrationRequests.createdAt))

    if (status !== "all") {
      return query.where(eq(registrationRequests.status, status))
    }

    return query
  })

export const approveRegistration = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((input: { id: string; groups: string[] }) => input)
  .handler(async ({ data, context }) => {
    if (!isUserAdmin(context.user)) {
      throw new AppError("Forbidden")
    }

    if (!data.groups || data.groups.length === 0) {
      throw new AppError("Minst én gruppe må velges.")
    }

    const request = await db.transaction(async (tx) => {
      const [req] = await tx
        .select()
        .from(registrationRequests)
        .where(eq(registrationRequests.id, data.id))
        .for("update")

      if (!req) throw new AppError("Forespørsel ikke funnet.")
      if (req.status !== "pending") {
        throw new AppError("Forespørselen er allerede behandlet.")
      }

      try {
        await usersApi.createUser({
          username: req.username,
          firstName: req.firstname,
          lastName: req.lastname,
          email: req.email,
          phone: req.phone,
          passwordHash: req.passwordHash,
        })
      } catch (err) {
        log.error(
          { username: req.username, err },
          "failed to create user via users-api",
        )
        throw err
      }

      for (const group of data.groups) {
        try {
          await usersApi.addGroupMember(group, "users", req.username)
        } catch (err) {
          log.error(
            { username: req.username, group, err },
            "failed to add user to group",
          )
        }
      }

      await tx
        .update(registrationRequests)
        .set({
          status: "approved",
          groupName: data.groups.join(", "),
          processedBy: context.user.username,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(registrationRequests.id, data.id))

      return req
    })

    log.info(
      {
        username: request.username,
        approvedBy: context.user.username,
        groups: data.groups,
      },
      "registration approved",
    )

    try {
      await sendMail({
        to: request.email,
        subject: `Foreningsbruker godkjent - ${request.username}`,
        text: [
          "Hei!",
          "",
          `Din foreningsbruker "${request.username}" er nå opprettet.`,
          "",
          `Du kan logge inn på ${env.appUrl}/intern/ med brukernavnet og passordet du oppga ved registrering.`,
          "",
          "Har du spørsmål, ta kontakt med it-gruppa@foreningenbs.no.",
        ].join("\n"),
      })
    } catch (err) {
      log.error(
        { username: request.username, err },
        "failed to send approval email",
      )
    }

    return { status: "approved" }
  })

export const rejectRegistration = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    if (!isUserAdmin(context.user)) {
      throw new AppError("Forbidden")
    }

    const request = await db.transaction(async (tx) => {
      const [req] = await tx
        .select()
        .from(registrationRequests)
        .where(eq(registrationRequests.id, data.id))
        .for("update")

      if (!req) throw new AppError("Forespørsel ikke funnet.")
      if (req.status !== "pending") {
        throw new AppError("Forespørselen er allerede behandlet.")
      }

      await tx
        .update(registrationRequests)
        .set({
          status: "rejected",
          processedBy: context.user.username,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(registrationRequests.id, data.id))

      return req
    })

    log.info(
      { username: request.username, rejectedBy: context.user.username },
      "registration rejected",
    )

    return { status: "rejected" }
  })
