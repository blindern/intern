import { AuthContext } from 'modules/core/auth/UserProvider'
import { useContext } from 'react'

export function useIsMemberOf(
  candidateGroupNames: string[],
  forceRealMember = false,
) {
  const auth = useContext(AuthContext)

  if (!auth.isLoggedIn) {
    return false
  }

  if (!forceRealMember && auth.isUserAdmin) return true

  for (const groupName of candidateGroupNames) {
    if (groupName in auth.user.group_relations) {
      return true
    }
  }

  return false
}
