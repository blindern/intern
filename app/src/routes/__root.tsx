import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AuthProvider } from "../features/auth/hooks.js"
import { FlashesProvider } from "../hooks/useFlashes.js"
import { TitleProvider } from "../hooks/useTitle.js"
import { Template } from "../components/Template.js"
import "../styles/frontend.scss"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (failureCount > 3) return false
        if (
          error instanceof Error &&
          error.message.includes("Not authenticated")
        ) {
          return false
        }
        return true
      },
    },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
    ],
    title: "Foreningen Blindern Studenterhjem",
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <FlashesProvider>
          <AuthProvider>
            <TitleProvider>
              <Template>
                <Outlet />
              </Template>
            </TitleProvider>
          </AuthProvider>
        </FlashesProvider>
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
