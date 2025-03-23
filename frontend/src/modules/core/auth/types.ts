type ArrayAtLeastOne<T> = { 0: T } & T[]

type GroupRelationMap = Record<string, ArrayAtLeastOne<string>>

interface UserDetailsBase {
  id: number
  unique_id: string
  username: string
  email: string | null
  realname: string | null
  phone: string
  groups: Group[] | string
  group_relations: GroupRelationMap
  groupowner_relations: GroupRelationMap
}

export type UserDetails = UserDetailsBase & {
  groups: string[]
}

export type UserDetailsFull = UserDetailsBase & {
  groups: Group[]
}

type AuthUserDetails = Omit<UserDetailsBase, "groups"> & {
  groups: Group[]
}

export interface Group {
  id: number
  unique_id: string
  name: string
  description: string | null
  owners: any // TODO
  members_real: any // TODO
  members_relation: any // TODO
}

export interface MeNotLoggedIn {
  isLoggedIn: false
  isUserAdmin: boolean
  isOffice: boolean
  csrfToken: string | null
}

interface MeLoggedIn {
  isLoggedIn: true
  isUserAdmin: boolean
  isOffice: boolean
  user: AuthUserDetails
  csrfToken: string
}

export type Me = MeNotLoggedIn | MeLoggedIn

export interface AuthInfo {
  isLoading: boolean
  isError: boolean
  error: Error | null
  data: Me
}
