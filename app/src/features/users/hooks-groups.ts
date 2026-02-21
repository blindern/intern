import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getGroups,
  getGroup,
  addGroupMember,
  removeGroupMember,
  addGroupOwner,
  removeGroupOwner,
} from "./server-fns.js"
import { useFlashes } from "../../hooks/useFlashes.js"

export type GroupDetail = Awaited<ReturnType<typeof getGroup>>

export function useGroupList() {
  return useQuery({
    queryKey: ["group", "list"],
    queryFn: () => getGroups(),
  })
}

export function useGroup(groupName: string) {
  return useQuery({
    queryKey: ["group", "item", groupName],
    queryFn: () => getGroup({ data: { name: groupName } }),
  })
}

function useGroupMutation<T>(
  groupName: string,
  mutationFn: (vars: T) => Promise<void>,
  successMessage: (vars: T) => string,
) {
  const queryClient = useQueryClient()
  const flashes = useFlashes()
  return useMutation({
    mutationFn,
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["group", "item", groupName],
      })
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
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
    async ({ memberType, memberId }: MemberParams) => {
      await addGroupMember({
        data: { groupName, memberType, memberId },
      })
    },
    ({ memberId }) => `${memberId} lagt til som medlem i ${groupName}`,
  )
}

export function useRemoveMemberMutation(groupName: string) {
  return useGroupMutation(
    groupName,
    async ({ memberType, memberId }: MemberParams) => {
      await removeGroupMember({
        data: { groupName, memberType, memberId },
      })
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
    async ({ ownerType, ownerId }: OwnerParams) => {
      await addGroupOwner({
        data: { groupName, ownerType, ownerId },
      })
    },
    ({ ownerId }) => `${ownerId} lagt til som administrator for ${groupName}`,
  )
}

export function useRemoveOwnerMutation(groupName: string) {
  return useGroupMutation(
    groupName,
    async ({ ownerType, ownerId }: OwnerParams) => {
      await removeGroupOwner({
        data: { groupName, ownerType, ownerId },
      })
    },
    ({ ownerId }) => `${ownerId} fjernet som administrator for ${groupName}`,
  )
}
