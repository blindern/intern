import { useAuthInfo } from "modules/core/auth/AuthInfoProvider.js"
import { AuthInfo } from "modules/core/auth/types.js"

export function isMemberOf(
  auth: AuthInfo,
  candidateGroupNames: string[],
  forceRealMember = false,
) {
  if (!auth.data.isLoggedIn) {
    return false
  }

  if (!forceRealMember && auth.data.isUserAdmin) return true

  for (const groupName of candidateGroupNames) {
    if (groupName in auth.data.user.group_relations) {
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
