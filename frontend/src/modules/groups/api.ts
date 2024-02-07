import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { Group, UserDetails } from "modules/core/auth/types.js"
import { useQuery } from "@tanstack/react-query"

export interface GroupDetail {
  id: number
  unique_id: string
  name: string
  description: string | null
  members: UserDetails[]
  owners: {
    users: string[]
    groups: string[]
  }
  members_real: {
    users: string[]
    groups: string[]
  }
  members_relation: Record<string, string[]>
}

export function useGroupList() {
  const api = useApiService()
  return useQuery({
    queryKey: ["group", "list"],

    queryFn: async () => {
      const response = await api.get("group")
      return (await response.json()) as Group[]
    },
  })
}

export function useGroup(groupName: string) {
  const api = useApiService()
  return useQuery({
    queryKey: ["group", "item", groupName],

    queryFn: async () => {
      const response = await api.get("group/" + encodeURIComponent(groupName))
      return (await response.json()) as GroupDetail
    },
  })
}
