import { useApiService } from "modules/core/api/ApiServiceProvider.js"
import { Group, UserDetails } from "modules/core/auth/types.js"
import { useFlashes } from "modules/core/flashes/FlashesProvider.js"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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

function useGroupMutation<T>(
  groupName: string,
  mutationFn: (api: ReturnType<typeof useApiService>, vars: T) => Promise<void>,
  successMessage: (vars: T) => string,
) {
  const api = useApiService()
  const queryClient = useQueryClient()
  const flashes = useFlashes()
  return useMutation({
    mutationFn: (vars: T) => mutationFn(api, vars),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["group", "item", groupName],
      })
      void queryClient.invalidateQueries({ queryKey: ["me"] })
      flashes.addFlash({ type: "success", message: successMessage(vars) })
    },
  })
}

interface MemberParams {
  memberType: "users" | "groups"
  memberId: string
}

export function useAddMemberMutation(groupName: string) {
  return useGroupMutation(
    groupName,
    async (api, { memberType, memberId }: MemberParams) => {
      await api.post(`group/${encodeURIComponent(groupName)}/members`, {
        memberType,
        memberId,
      })
    },
    ({ memberId }) => `${memberId} lagt til som medlem i ${groupName}`,
  )
}

export function useRemoveMemberMutation(groupName: string) {
  return useGroupMutation(
    groupName,
    async (api, { memberType, memberId }: MemberParams) => {
      await api.delete(
        `group/${encodeURIComponent(groupName)}/members/${encodeURIComponent(memberType)}/${encodeURIComponent(memberId)}`,
      )
    },
    ({ memberId }) => `${memberId} fjernet som medlem fra ${groupName}`,
  )
}

interface OwnerParams {
  ownerType: "users" | "groups"
  ownerId: string
}

export function useAddOwnerMutation(groupName: string) {
  return useGroupMutation(
    groupName,
    async (api, { ownerType, ownerId }: OwnerParams) => {
      await api.post(`group/${encodeURIComponent(groupName)}/owners`, {
        ownerType,
        ownerId,
      })
    },
    ({ ownerId }) => `${ownerId} lagt til som administrator for ${groupName}`,
  )
}

export function useRemoveOwnerMutation(groupName: string) {
  return useGroupMutation(
    groupName,
    async (api, { ownerType, ownerId }: OwnerParams) => {
      await api.delete(
        `group/${encodeURIComponent(groupName)}/owners/${encodeURIComponent(ownerType)}/${encodeURIComponent(ownerId)}`,
      )
    },
    ({ ownerId }) => `${ownerId} fjernet som administrator for ${groupName}`,
  )
}
