import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { UserDetails, UserDetailsFull } from "modules/core/auth/types.js"
import { useQuery } from "@tanstack/react-query"

export function useUserList() {
  const api = useApiService()
  return useQuery(["user", "list"], async () => {
    const response = await api.get("user")
    return (await response.json()) as UserDetails[]
  })
}

export function useUser(username: string) {
  const api = useApiService()
  return useQuery(["user", "item", username], async () => {
    const response = await api.get("user/" + encodeURIComponent(username))
    return (await response.json()) as UserDetailsFull
  })
}
