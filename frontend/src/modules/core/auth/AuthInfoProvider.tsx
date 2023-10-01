import { useAuthService } from "modules/core/auth/AuthServiceProvider.js"
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Subscription } from "rxjs"
import { defaultAuthInfo } from "./AuthService.js"
import { AuthInfo } from "./types.js"

const AuthInfoContext = createContext<AuthInfo>(defaultAuthInfo)

export function useAuthInfo() {
  return useContext(AuthInfoContext)
}

export function AuthInfoProvider({ children }: { children: ReactNode }) {
  const subscriber = useRef<Subscription>()
  const [authInfo, setAuthInfo] = useState<AuthInfo>(defaultAuthInfo)
  const authService = useAuthService()

  useEffect(() => {
    subscriber.current = authService
      .getAuthInfoObservable()
      .subscribe((value) => {
        setAuthInfo(value)
      })

    // TODO: Handle rejection
    void authService.fetchAuthInfo()

    return () => {
      subscriber.current?.unsubscribe()
    }
  }, [authService])

  return (
    <AuthInfoContext.Provider value={authInfo}>
      {children}
    </AuthInfoContext.Provider>
  )
}
