import Template from 'layout/Template'
import ArrplanPage from 'modules/arrplan/ArrplanPage'
import Login from 'modules/core/auth/Login'
import UserProvider from 'modules/core/auth/UserProvider'
import FlashesProvider from 'modules/core/flashes/FlashesProvider'
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
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

// TODO: Handle 401 responses
// if (e instanceof NotAuthedError) {
//   authService.setLoginRedirectUrl(location.pathname)
//   navigate('/login')
const queryClient = new QueryClient()

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

    <Route path='/bokdatabase' element={<Todo />} />
    <Route path='/books' element={<Todo />} />
    <Route path='/books/register' element={<Todo />} />
    <Route path='/books/:id' element={<Todo />} />
    <Route path='/books/:id/edit' element={<Todo />} />

    <Route path='/bukker' element={<Todo />} />
    <Route path='/bukker/:id' element={<Todo />} />

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
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename='/intern'>
      <FlashesProvider>
        <TitleProvider>
          <>
            <PageTitle title='Foreningen Blindern Studenterhjem' />
            <UserProvider>
              <Template>
                <RouteList />
              </Template>
            </UserProvider>
          </>
        </TitleProvider>
      </FlashesProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

export default App
