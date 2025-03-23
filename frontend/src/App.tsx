import { NotFoundPage } from "components/NotFoundPage.js"
import { createBrowserHistory } from "history"
import { Template } from "layout/Template.js"
import { ArrplanPage } from "modules/arrplan/ArrplanPage.js"
import { BookPage } from "modules/books/BookPage.js"
import { EditBookPage } from "modules/books/EditBookPage.js"
import { ListBooksPage } from "modules/books/ListBooksPage.js"
import { RegisterBookPage } from "modules/books/RegisterBookPage.js"
import { BukkPage } from "modules/bukker/BukkPage.js"
import { ListBukkerPage } from "modules/bukker/ListBukkerPage.js"
import { ApiService } from "modules/core/api/ApiService.js"
import { ApiServiceProvider } from "modules/core/api/ApiServiceProvider.js"
import {
  BadRequestError,
  ForbiddenError,
  NotAuthedError,
  NotFoundError,
} from "modules/core/api/errors.js"
import { AuthInfoProvider } from "modules/core/auth/AuthInfoProvider.js"
import { AuthService } from "modules/core/auth/AuthService.js"
import { AuthServiceProvider } from "modules/core/auth/AuthServiceProvider.js"
import { LoggedOutHandler } from "modules/core/auth/LoggedOutHandler.js"
import { FlashesService } from "modules/core/flashes/FlahesService.js"
import { FlashesProvider } from "modules/core/flashes/FlashesProvider.js"
import { CustomRouter } from "modules/core/routing/CustomRouter.js"
import { PageTitle } from "modules/core/title/PageTitle.js"
import { TitleProvider } from "modules/core/title/TitleProvider.js"
import { DugnadsinnkallingerPage } from "modules/dugnaden/DugnadsinnkallingerPage.js"
import { GoogleAppsPage } from "modules/googleapps/GoogleAppsPage.js"
import { GroupPage } from "modules/groups/GroupPage.js"
import { ListGroupsPage } from "modules/groups/ListGroupsPage.js"
import { HomePage } from "modules/home/HomePage.js"
import { MatmenyPage } from "modules/matmeny/MatmenyPage.js"
import { PrinterInvoicingPage } from "modules/printer/invoicing/PrinterInvoicingPage.js"
import { LastPrintsPage } from "modules/printer/LastPrintsPage.js"
import { RegisterUserPage } from "modules/registeruser/RegisterUserPage.js"
import { ListUsersPage } from "modules/users/ListUsersPage.js"
import { UserPage } from "modules/users/UserPage.js"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Navigate, Route, Routes } from "react-router-dom"

const history = createBrowserHistory()

const flashesService = new FlashesService()
const apiService = new ApiService(flashesService, history)
const authService = new AuthService(apiService)
apiService.setAuthService(authService)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Override default retry logic (that uses 3 retries)
      // so we ignore certain errors.
      retry(failureCount, error) {
        if (failureCount > 3) {
          return false
        }
        if (
          error instanceof NotFoundError ||
          error instanceof NotAuthedError ||
          error instanceof BadRequestError ||
          error instanceof ForbiddenError
        ) {
          return false
        }
        return true
      },
    },
  },
})

function ArrplanRedir() {
  const d = new Date()
  const sem =
    (d.getMonth() >= 6 ? "h" : "v") + d.getFullYear().toString().substring(2, 4)

  return <Navigate to={`/arrplan/${sem}`} />
}

const RouteList = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />

    <Route path="/arrplan" element={<ArrplanRedir />} />
    <Route path="/arrplan/:semester" element={<ArrplanPage />} />

    <Route path="/register" element={<RegisterUserPage />} />

    <Route path="/bokdatabase" element={<Navigate to="/books" />} />
    <Route path="/books" element={<ListBooksPage />} />
    <Route path="/books/register" element={<RegisterBookPage />} />
    <Route path="/books/:id" element={<BookPage />} />
    <Route path="/books/:id/edit" element={<EditBookPage />} />

    <Route path="/bukker" element={<ListBukkerPage />} />
    <Route path="/bukker/:id" element={<BukkPage />} />

    <Route path="/dugnaden/old/list" element={<DugnadsinnkallingerPage />} />

    <Route path="/googleapps" element={<GoogleAppsPage />} />

    <Route path="/groups" element={<ListGroupsPage />} />
    <Route path="/group/:name" element={<GroupPage />} />

    <Route path="/matmeny" element={<MatmenyPage />} />

    <Route path="/printer/siste" element={<LastPrintsPage />} />
    <Route path="/printer/fakturere" element={<PrinterInvoicingPage />} />

    <Route path="/users" element={<ListUsersPage />} />
    <Route path="/user/:name" element={<UserPage />} />

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
)

export const App = () => (
  <CustomRouter history={history} basename="/intern">
    <AuthServiceProvider authService={authService}>
      <ApiServiceProvider apiService={apiService}>
        <FlashesProvider flashesService={flashesService}>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            <LoggedOutHandler>
              <TitleProvider>
                <>
                  <PageTitle title="Foreningen Blindern Studenterhjem" />
                  <AuthInfoProvider>
                    <Template>
                      <RouteList />
                    </Template>
                  </AuthInfoProvider>
                </>
              </TitleProvider>
            </LoggedOutHandler>
          </QueryClientProvider>
        </FlashesProvider>
      </ApiServiceProvider>{" "}
    </AuthServiceProvider>
  </CustomRouter>
)
