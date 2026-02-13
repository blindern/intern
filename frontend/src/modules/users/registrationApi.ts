import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface RegistrationRequest {
  id: string
  username: string
  firstname: string
  lastname: string
  email: string
  phone: string | null
  status: "pending" | "approved" | "rejected"
  group_name: string | null
  processed_by: string | null
  processed_at: string | null
  created_at: string
}

export function useRegistrationRequests(status: string, enabled = true) {
  const api = useApiService()
  return useQuery({
    queryKey: ["registration-requests", status],
    queryFn: async () => {
      const response = await api.get(
        `registration-requests?status=${encodeURIComponent(status)}`,
      )
      return (await response.json()) as RegistrationRequest[]
    },
    enabled,
  })
}

export function useApproveRegistrationMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, groups }: { id: string; groups: string[] }) => {
      await api.post(
        `registration-requests/${encodeURIComponent(id)}/approve`,
        {
          groups,
        },
      )
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["registration-requests"],
      })
    },
  })
}

export function useRejectRegistrationMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`registration-requests/${encodeURIComponent(id)}/reject`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["registration-requests"],
      })
    },
  })
}
