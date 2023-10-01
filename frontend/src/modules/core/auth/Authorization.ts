import { useAuthInfo } from "modules/core/auth/AuthInfoProvider.js"
import { isMemberOf } from "modules/core/auth/hooks.js"

export function useAuthorization() {
  const authInfo = useAuthInfo()

  return {
    bookAdmin: isMemberOf(authInfo, ["biblioteksutvalget"]),
  }
}
