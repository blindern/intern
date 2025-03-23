import { createContext, ReactNode, useContext } from "react"
import { ApiService } from "./ApiService.js"

const ApiServiceContext = createContext<ApiService | null>(null)

export function useApiService() {
  const result = useContext(ApiServiceContext)
  if (result == null) {
    throw new Error("ApiService not in context")
  }
  return result
}

export function ApiServiceProvider({
  children,
  apiService,
}: {
  children: ReactNode
  apiService: ApiService
}) {
  return (
    <ApiServiceContext.Provider value={apiService}>
      {children}
    </ApiServiceContext.Provider>
  )
}
