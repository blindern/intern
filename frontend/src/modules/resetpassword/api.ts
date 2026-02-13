import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { useMutation, useQuery } from "@tanstack/react-query"

export function useRequestPasswordResetMutation() {
  const api = useApiService()
  return useMutation({
    mutationFn: async (email: string) => {
      await api.post("password-reset/request", { email })
    },
  })
}

export function useValidateTokenQuery(token: string | null) {
  const api = useApiService()
  return useQuery({
    queryKey: ["password-reset-validate", token],
    queryFn: async () => {
      await api.post("password-reset/validate", { token })
      return { valid: true }
    },
    enabled: !!token,
    retry: false,
  })
}

export function useResetPasswordMutation() {
  const api = useApiService()
  return useMutation({
    mutationFn: async ({
      token,
      password,
    }: {
      token: string
      password: string
    }) => {
      await api.post("password-reset/reset", { token, password })
    },
  })
}
