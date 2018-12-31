import { get } from 'api'
import { Group, UserDetails } from 'modules/core/auth/types'

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

class GroupsService {
  async getGroupList() {
    const response = await get('group')
    return (await response.json()) as Group[]
  }

  async getGroup(groupName: string) {
    const response = await get('group/' + encodeURIComponent(groupName))
    return (await response.json()) as GroupDetail
  }
}

export const groupsService = new GroupsService()
