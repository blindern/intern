import { useAuthService } from "modules/core/auth/AuthServiceProvider"
import React, { ReactNode, useCallback } from "react"

export function LogoutLink({ children }: { children: ReactNode }) {
  const authService = useAuthService()

  const logoutHandler = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      authService.logout()
    },
    [authService],
  )

  return (
    <a href="/" onClick={logoutHandler}>
      {children}
    </a>
  )
}
