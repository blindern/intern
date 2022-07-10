import { get } from 'api'
import { UserDetails, UserDetailsFull } from 'modules/core/auth/types'
import { useQuery } from 'react-query'

export function useUserList() {
  return useQuery(['user', 'list'], async () => {
    const response = await get('user')
    return (await response.json()) as UserDetails[]
  })
}

export function useUser(username: string) {
  return useQuery(['user', 'item', username], async () => {
    const response = await get('user/' + encodeURIComponent(username))
    return (await response.json()) as UserDetailsFull
  })
}
