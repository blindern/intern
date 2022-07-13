import { useAuthService } from "modules/core/auth/AuthServiceProvider"
import React, { ReactNode, useMemo } from "react"
import { useQueryClient } from "react-query"

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
  }, [])

  return <>{children}</>
}