import { createContext, ReactNode, useContext } from "react"
import { useQuery } from "@tanstack/react-query"
import { getMe } from "../server-fns/auth.js"

type MeData = Awaited<ReturnType<typeof getMe>>

export interface AuthInfo {
  isLoading: boolean
  isError: boolean
  error: Error | null
  data: MeData
}

const defaultData: MeData = {
  isLoggedIn: false,
  isUserAdmin: false,
}

const AuthContext = createContext<AuthInfo>({
  isLoading: true,
  isError: false,
  error: null,
  data: defaultData,
})

export function useAuthInfo() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => getMe(),
    staleTime: 60_000,
  })

  const value: AuthInfo = {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    data: query.data ?? defaultData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useIsMemberOf(
  groupNames: string[],
  forceRealMember = false,
): boolean {
  const auth = useAuthInfo()
  if (!auth.data.isLoggedIn) return false
  if (!forceRealMember && auth.data.isUserAdmin) return true

  const user = auth.data.user
  for (const groupName of groupNames) {
    if (user.groups?.includes(groupName)) return true
  }

  return false
}
