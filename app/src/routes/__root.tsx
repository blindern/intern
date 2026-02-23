import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router"
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { AuthProvider } from "../features/auth/hooks.js"
import { FlashesProvider } from "../hooks/useFlashes.js"
import { TitleProvider } from "../hooks/useTitle.js"
import { Template } from "../components/Template.js"
import "../styles/frontend.scss"

const AUTH_ERROR_MESSAGE = "Denne siden krever at du logger inn."
// AppError messages are expected client errors (auth, forbidden, not found,
// validation) that should not be retried.
const APP_ERROR_MESSAGES = [AUTH_ERROR_MESSAGE, "Forbidden", "Not found"]

function isAppError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  // AppError.name is not preserved across the server→client boundary,
  // so we match on known messages instead.
  return APP_ERROR_MESSAGES.includes(error.message)
}
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error) {
      if (error instanceof Error && error.message === AUTH_ERROR_MESSAGE) {
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.assign(`/intern/api/saml2/login?returnTo=${returnTo}`)
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (failureCount > 3) return false
        if (isAppError(error)) return false
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
