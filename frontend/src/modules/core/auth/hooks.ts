import { useAuthInfo } from 'modules/core/auth/AuthInfoProvider'
import { AuthInfo } from 'modules/core/auth/types'

export function isMemberOf(
  auth: AuthInfo,
  candidateGroupNames: string[],
  forceRealMember = false,
) {
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

export function useIsMemberOf(
  candidateGroupNames: string[],
  forceRealMember?: boolean,
) {
  const authInfo = useAuthInfo()
  return isMemberOf(authInfo, candidateGroupNames, forceRealMember)
}
