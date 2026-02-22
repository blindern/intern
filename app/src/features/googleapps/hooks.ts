import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getGoogleAppsAccounts,
  createGoogleAppsAccount,
  updateGoogleAppsAccount,
  deleteGoogleAppsAccount,
  createGoogleAppsAccountUser,
  updateGoogleAppsAccountUser,
  deleteGoogleAppsAccountUser,
} from "./server-fns.js"

export type Account = Awaited<ReturnType<typeof getGoogleAppsAccounts>>[number]
export type AccountUser = NonNullable<Account["users"]>[number]

const listQueryKey = ["googleapps", "accounts", "list"]

export function useGoogleAppsAccounts() {
  return useQuery({
    queryKey: listQueryKey,
    queryFn: () => getGoogleAppsAccounts({ data: { expand: true } }),
  })
}

export function useGoogleAppsCreateAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { accountname: string; group: string }) => {
      return createGoogleAppsAccount({ data })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })
}

export function useGoogleAppsUpdateAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      id: string
      accountname: string
      group: string
      aliases?: string[] | null
    }) => {
      return updateGoogleAppsAccount({ data })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })
}

export function useGoogleAppsDeleteAccountMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      await deleteGoogleAppsAccount({ data })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })
}

export function useGoogleAppsCreateAccountUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      accountname: string
      username: string
      notification?: boolean
    }) => {
      return createGoogleAppsAccountUser({ data })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })
}

export function useGoogleAppsUpdateAccountUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string; notification: boolean }) => {
      return updateGoogleAppsAccountUser({ data })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })
}

export function useGoogleAppsDeleteAccountUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { id: string }) => {
      await deleteGoogleAppsAccountUser({ data })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: listQueryKey })
    },
  })
}
