import { useApiService } from "modules/core/api/ApiServiceProvider"
import { useMutation, useQuery, useQueryClient } from "react-query"

export interface CreateAccountPayload {
  accountname: string
  group: string
}

export interface AccountUser {
  account_id: string
  created_at: string // "2018-09-09 13:41:30"
  email: string
  notification: boolean
  realname: string
  updated_at: string // "2018-09-09 13:41:30"
  username: string
  _id: string
}

export interface Account {
  accountname: string
  aliases?: string[]
  created_at: string // "2018-09-09 13:36:49"
  group: string
  updated_at: string // "2022-01-27 13:41:09"
  users?: AccountUser[]
  _id: string
}

export interface CreateAccountUserPayload {
  accountname: string
  username: string
  notification: boolean
}

const listQueryKey = ["googleapps", "accounts", "list"]

export function useGoogleAppsAccounts() {
  const api = useApiService()
  return useQuery(listQueryKey, async () => {
    const response = await api.get("googleapps/accounts?expand=1")
    return (await response.json()) as Account[]
  })
}

export function useGoogleAppsCreateAccountMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()

  return useMutation(
    async (data: CreateAccountPayload) => {
      const response = await api.post("googleapps/accounts", data)
      return (await response.json()) as Account
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(listQueryKey)
      },
    },
  )
}

export function useGoogleAppsUpdateAccountMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()

  return useMutation(
    async (data: Account) => {
      const response = await api.put(
        "googleapps/accounts/" + encodeURIComponent(data._id),
        data,
      )
      return (await response.json()) as Account
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(listQueryKey)
      },
    },
  )
}

export function useGoogleAppsDeleteAccountMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()

  return useMutation(
    async (data: Account) => {
      const response = await api.delete(
        "googleapps/accounts/" + encodeURIComponent(data._id),
      )
      if (!response.ok) {
        console.log(response)
        throw new Error("Response failed")
      }
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(listQueryKey)
      },
    },
  )
}

export function useGoogleAppsCreateAccountUserMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()

  return useMutation(
    async (data: CreateAccountUserPayload) => {
      const response = await api.post("googleapps/accountusers", data)
      return (await response.json()) as AccountUser
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(listQueryKey)
      },
    },
  )
}

export function useGoogleAppsUpdateAccountUserMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()

  return useMutation(
    async (data: AccountUser) => {
      const response = await api.put(
        "googleapps/accountusers/" + encodeURIComponent(data._id),
        data,
      )
      return (await response.json()) as AccountUser
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(listQueryKey)
      },
    },
  )
}

export function useGoogleAppsDeleteAccountUserMutation() {
  const api = useApiService()
  const queryClient = useQueryClient()

  return useMutation(
    async (data: AccountUser) => {
      const response = await api.delete(
        "googleapps/accountusers/" + encodeURIComponent(data._id),
      )
      if (!response.ok) {
        console.log(response)
        throw new Error("Response failed")
      }
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(listQueryKey)
      },
    },
  )
}
