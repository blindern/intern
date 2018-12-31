import React from 'react'

type ArrayAtLeastOne<T> = { 0: T } & T[]

interface GroupRelationMap {
  // group: [reason]
  [group: string]: ArrayAtLeastOne<string>
}

interface UserData {
  id: number
  unique_id: string
  username: string
  email: string | null
  realname: string | null
  phone: string | null
  groups: Group[]
  group_relations: GroupRelationMap
  groupowner_relations: GroupRelationMap
}

interface Group {
  id: number
  unique_id: string
  name: string
  description: string | null
  owners: any // TODO
  members_real: any // TODO
  members_relation: any // TODO
}

interface UserInfoNotLoggedIn {
  isLoggedIn: false
  isUserAdmin: boolean
  isOffice: boolean
  user: null
}

interface UserInfoLoggedIn {
  isLoggedIn: true
  isUserAdmin: boolean
  isOffice: boolean
  user: UserData
}

type UserInfo = UserInfoNotLoggedIn | UserInfoLoggedIn

const defaultUserData: UserInfoNotLoggedIn = {
  isLoggedIn: false,
  isUserAdmin: false,
  isOffice: false,
  user: null,
}

export const UserContext = React.createContext<UserInfo>(defaultUserData)

class UserProvider extends React.Component {
  state = {
    data: defaultUserData,
  }

  componentDidMount() {
    // TODO: Fetch user details
  }

  render() {
    return (
      <UserContext.Provider value={this.state.data}>
        {this.props.children}
      </UserContext.Provider>
    )
  }
}

export default UserProvider
