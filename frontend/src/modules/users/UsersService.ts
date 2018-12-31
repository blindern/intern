import { get } from 'api'
import { UserDetailsFull } from 'modules/core/auth/types'

class UsersService {
  async getUserList() {
    const response = await get('user')
    return await response.json()
  }

  async getUser(username: string) {
    const response = await get('user/' + encodeURIComponent(username))
    return (await response.json()) as UserDetailsFull
  }
}

export const usersService = new UsersService()
