import { useAuthService } from "modules/core/auth/AuthServiceProvider.js"
import React, { ReactNode } from "react"

export function LoginLink({ children }: { children: ReactNode }) {
  const authService = useAuthService()

  return <a href={authService.getLoginUrl()}>{children}</a>
}
