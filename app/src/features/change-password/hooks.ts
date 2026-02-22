import { useMutation } from "@tanstack/react-query"
import { changePassword } from "./server-fns.js"

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => {
      await changePassword({ data: { currentPassword, newPassword } })
    },
  })
}
