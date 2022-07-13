import React, {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { AuthService } from "./AuthService"

const AuthServiceContext = createContext<AuthService | null>(null)

export function useAuthService() {
  const result = useContext(AuthServiceContext)
  if (result == null) {
    throw new Error("AuthService not in context")
  }
  return result
}

function Logout() {
  const authService = useAuthService()
  const formRef = useRef<HTMLFormElement>(null)

  const action = authService.getLogoutUrl()

  useLayoutEffect(() => {
    formRef.current?.submit()
  }, [action])

  return <form ref={formRef} action={action} method="post" />
}

export function AuthServiceProvider({
  children,
  authService,
}: {
  children: ReactNode
  authService: AuthService
}) {
  const [shouldLogout, setShouldLogout] = useState(false)

  useMemo(() => {
    const subscriber = authService
      .getShouldLogoutObservable()
      .subscribe((value) => {
        setShouldLogout(value)
      })

    return () => {
      subscriber.unsubscribe()
    }
  }, [])

  return (
    <AuthServiceContext.Provider value={authService}>
      {shouldLogout && <Logout />}
      {children}
    </AuthServiceContext.Provider>
  )
}
