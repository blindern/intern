import { createBrowserHistory } from 'history'
import Template from 'layout/Template'
import ArrplanPage from 'modules/arrplan/ArrplanPage'
import { BookPage } from 'modules/books/BookPage'
import { EditBookPage } from 'modules/books/EditBookPage'
import { ListBooksPage } from 'modules/books/ListBooksPage'
import { RegisterBookPage } from 'modules/books/RegisterBookPage'
import { BukkListPage } from 'modules/bukker/BukkListPage'
import { BukkPage } from 'modules/bukker/BukkPage'
import { ApiService } from 'modules/core/api/ApiService'
import { ApiServiceProvider } from 'modules/core/api/ApiServiceProvider'
import { ResponseError } from 'modules/core/api/errors'
import { AuthInfoProvider } from 'modules/core/auth/AuthInfoProvider'
import { AuthService } from 'modules/core/auth/AuthService'
import { AuthServiceProvider } from 'modules/core/auth/AuthServiceProvider'
import Login from 'modules/core/auth/Login'
import FlashesService from 'modules/core/flashes/FlahesService'
import { FlashesProvider } from 'modules/core/flashes/FlashesProvider'
import { CustomRouter } from 'modules/core/routing/CustomRouter'
import { PageTitle } from 'modules/core/title/PageTitle'
import TitleProvider from 'modules/core/title/TitleProvider'
import DugnadsinnkallingerPage from 'modules/dugnaden/DugnadsinnkallingerPage'
import { GoogleAppsPage } from 'modules/googleapps/GoogleApps'
import GroupListPage from 'modules/groups/GroupListPage'
import GroupPage from 'modules/groups/GroupPage'
import Home from 'modules/home/Home'
import { MatmenyPage } from 'modules/matmeny/MatmenyPage'
import { PrinterInvoicingPage } from 'modules/printer/invoicing/PrinterInvoicingPage'
import LastPrintsPage from 'modules/printer/LastPrintsPage'
import RegisterUserPage from 'modules/registeruser/RegisterUserPage'
import UserListPage from 'modules/users/UserListPage'
import UserPage from 'modules/users/UserPage'
import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Navigate, Route, Routes } from 'react-router-dom'

const history = createBrowserHistory()

const flashesService = new FlashesService()
const apiService = new ApiService(flashesService, history)
const authService = new AuthService(apiService)
apiService.setAuthService(authService)

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      async onError(error) {
        if (error instanceof ResponseError) {
          await apiService.handleErrors2(error)
        }
      },
    },
    queries: {
      async onError(error) {
        console.log('got error', error)
        if (error instanceof ResponseError) {
          await apiService.handleErrors2(error)
        }
      },
    },
  },
})

const Todo = () => (
  <>
    <PageTitle title='TODO' />
    <p>TODO</p>
  </>
)

function ArrplanRedir() {
  const d = new Date()
  const sem =
    (d.getMonth() >= 6 ? 'h' : 'v') + d.getFullYear().toString().substring(2, 4)

  return <Navigate to={`/arrplan/${sem}`} />
}

const RouteList = () => (
  <Routes>
    <Route path='/' element={<Home />} />

    <Route path='/arrplan' element={<ArrplanRedir />} />
    <Route path='/arrplan/:semester' element={<ArrplanPage />} />

    <Route path='/login' element={<Login />} />
    <Route path='/registrer' element={<RegisterUserPage />} />
    <Route path='/logout' element={<Todo />} />

    <Route path='/bokdatabase' element={<Navigate to={'/books'} />} />
    <Route path='/books' element={<ListBooksPage />} />
    <Route path='/books/register' element={<RegisterBookPage />} />
    <Route path='/books/:id' element={<BookPage />} />
    <Route path='/books/:id/edit' element={<EditBookPage />} />

    <Route path='/bukker' element={<BukkListPage />} />
    <Route path='/bukker/:id' element={<BukkPage />} />

    <Route path='/dugnaden/old/list' element={<DugnadsinnkallingerPage />} />

    <Route path='/googleapps' element={<GoogleAppsPage />} />

    <Route path='/groups' element={<GroupListPage />} />
    <Route path='/group/:name' element={<GroupPage />} />

    <Route path='/matmeny' element={<MatmenyPage />} />

    <Route path='/printer/siste' element={<LastPrintsPage />} />
    <Route path='/printer/fakturere' element={<PrinterInvoicingPage />} />

    <Route path='/users' element={<UserListPage />} />
    <Route path='/user/:name' element={<UserPage />} />
  </Routes>
)

const App = () => (
  <CustomRouter history={history} basename='/intern'>
    <AuthServiceProvider authService={authService}>
      <ApiServiceProvider apiService={apiService}>
        <FlashesProvider flashesService={flashesService}>
          <QueryClientProvider client={queryClient}>
            <TitleProvider>
              <>
                <PageTitle title='Foreningen Blindern Studenterhjem' />
                <AuthInfoProvider>
                  <Template>
                    <RouteList />
                  </Template>
                </AuthInfoProvider>
              </>
            </TitleProvider>
          </QueryClientProvider>
        </FlashesProvider>
      </ApiServiceProvider>{' '}
    </AuthServiceProvider>
  </CustomRouter>
)

export default App
