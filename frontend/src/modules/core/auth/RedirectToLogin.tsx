import { useAuthService } from "modules/core/auth/AuthServiceProvider.js"
import React, { ReactNode, useLayoutEffect } from "react"

export function RedirectToLogin({ children = null }: { children?: ReactNode }) {
  const authService = useAuthService()

  useLayoutEffect(() => {
    window.location.assign(authService.getLoginUrl())
  }, [authService])

  return <>{children}</>
}
