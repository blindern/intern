import { get } from 'api'
import { Group, UserDetails } from 'modules/core/auth/types'
import { useQuery } from 'react-query'

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
  members_relation: {
    [name: string]: string[]
  }
}

export function useGroupList() {
  return useQuery(['group', 'list'], async () => {
    const response = await get('group')
    return (await response.json()) as Group[]
  })
}

export function useGroup(groupName: string) {
  return useQuery(['group', 'item', groupName], async () => {
    const response = await get('group/' + encodeURIComponent(groupName))
    return (await response.json()) as GroupDetail
  })
}
