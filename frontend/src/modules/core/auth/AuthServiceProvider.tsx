import React, { createContext, ReactNode, useContext } from 'react'
import { AuthService } from './AuthService'

const AuthServiceContext = createContext<AuthService | null>(null)

export function useAuthService() {
  const result = useContext(AuthServiceContext)
  if (result == null) {
    throw new Error('AuthService not in context')
  }
  return result
}

export function AuthServiceProvider({
  children,
  authService,
}: {
  children: ReactNode
  authService: AuthService
}) {
  return (
    <AuthServiceContext.Provider value={authService}>
      {children}
    </AuthServiceContext.Provider>
  )
}
