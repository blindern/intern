import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { useMutation } from "@tanstack/react-query"

export interface RegisterData {
  username: string
  firstname: string
  lastname: string
  email: string
  phone: string
  password: string
}

export function useRegisterUserMutation() {
  const api = useApiService()
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      await api.post("register", data)
    },
  })
}
