import { useAuthInfo } from "modules/core/auth/AuthInfoProvider"
import { isMemberOf } from "modules/core/auth/hooks"

export function useAuthorization() {
  const authInfo = useAuthInfo()

  return {
    bookAdmin: isMemberOf(authInfo, ["biblioteksutvalget"]),
  }
}
