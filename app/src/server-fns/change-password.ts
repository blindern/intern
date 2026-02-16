import { createServerFn } from "@tanstack/react-start"
import { authMiddleware } from "../server/auth.js"
import { sshaHash } from "../server/password.js"
import { usersApi } from "../server/users-api.js"

export const changePassword = createServerFn({
  method: "POST",
})
  .middleware([authMiddleware])
  .inputValidator(
    (input: { currentPassword: string; newPassword: string }) => input,
  )
  .handler(async ({ data, context }) => {
    if (!data.currentPassword || !data.newPassword) {
      throw new Error("Begge passordfelt må fylles ut.")
    }

    if (data.newPassword.length < 8) {
      throw new Error("Nytt passord må være på minst 8 tegn.")
    }

    // Verify current password
    const valid = await usersApi.verifyCredentials(
      context.user.username,
      data.currentPassword,
    )

    if (!valid) {
      throw new Error("Nåværende passord er feil.")
    }

    // Hash and update
    const passwordHash = sshaHash(data.newPassword)
    await usersApi.modifyUser(context.user.username, {
      passwordHash: { value: passwordHash },
    })

    return {
      messages: [
        {
          type: "success",
          message: "Passordet er oppdatert.",
        },
      ],
    }
  })
