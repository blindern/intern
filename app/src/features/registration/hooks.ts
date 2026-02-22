import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  submitRegistration,
  getRegistrationRequests,
  approveRegistration,
  rejectRegistration,
} from "./server-fns.js"

export function useRegisterUserMutation() {
  return useMutation({
    mutationFn: async (data: {
      firstname: string
      lastname: string
      username: string
      email: string
      password: string
      phone?: string | null
    }) => {
      await submitRegistration({ data })
    },
  })
}

export function useRegistrationRequests(status: string, enabled = true) {
  return useQuery({
    queryKey: ["registration-requests", status],
    queryFn: () => getRegistrationRequests({ data: { status } }),
    enabled,
  })
}

export function useApproveRegistrationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, groups }: { id: string; groups: string[] }) => {
      await approveRegistration({ data: { id, groups } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["registration-requests"],
      })
    },
  })
}

export function useRejectRegistrationMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await rejectRegistration({ data: { id } })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["registration-requests"],
      })
    },
  })
}
