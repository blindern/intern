import { useMutation, useQuery } from "@tanstack/react-query"
import {
  requestPasswordReset,
  validateResetToken,
  resetPassword,
} from "./server-fns.js"

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: async (email: string) => {
      await requestPasswordReset({ data: { email } })
    },
  })
}

export function useValidateTokenQuery(token: string | null) {
  return useQuery({
    queryKey: ["password-reset-validate", token],
    queryFn: async () => {
      await validateResetToken({ data: { token: token! } })
      return { valid: true }
    },
    enabled: !!token,
    retry: false,
  })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async ({
      token,
      password,
    }: {
      token: string
      password: string
    }) => {
      await resetPassword({ data: { token, password } })
    },
  })
}
