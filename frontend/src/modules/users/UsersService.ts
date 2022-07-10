import { get } from 'api'
import { UserDetails, UserDetailsFull } from 'modules/core/auth/types'

class UsersService {
  async getUserList(): Promise<UserDetails[]> {
    const response = await get('user')
    return (await response.json()) as UserDetails[]
  }

  async getUser(username: string) {
    const response = await get('user/' + encodeURIComponent(username))
    return (await response.json()) as UserDetailsFull
  }
}

export const usersService = new UsersService()
