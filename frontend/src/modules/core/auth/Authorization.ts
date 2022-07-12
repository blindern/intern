import { isMemberOf } from 'modules/core/auth/hooks'
import { AuthContext } from 'modules/core/auth/UserProvider'
import { useContext } from 'react'

export function useAuthorization() {
  const auth = useContext(AuthContext)

  return {
    bookAdmin: isMemberOf(auth, ['biblioteksutvalget']),
  }
}
