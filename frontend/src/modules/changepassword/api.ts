import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { useMutation } from "@tanstack/react-query"

export function useChangePasswordMutation() {
  const api = useApiService()
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => {
      await api.post("change-password", { currentPassword, newPassword })
    },
  })
}
