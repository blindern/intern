import { useAuthService } from "modules/core/auth/AuthServiceProvider.js"
import React, { ReactNode, useMemo } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function LoggedOutHandler({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const authService = useAuthService()

  useMemo(() => {
    const subscriber = authService
      .getPossiblyLoggedOutObservable()
      .subscribe(() => {
        void queryClient.resetQueries()
      })

    return () => {
      subscriber.unsubscribe()
    }
  }, [authService, queryClient])

  return <>{children}</>
}
