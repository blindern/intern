import Template from 'layout/Template'
import Login from 'modules/core/auth/Login'
import UserProvider from 'modules/core/auth/UserProvider'
import FlashesProvider from 'modules/core/flashes/FlashesProvider'
import { PageTitle } from 'modules/core/title/PageTitle'
import TitleProvider from 'modules/core/title/TitleProvider'
import DugnadsinnkallingerPage from 'modules/dugnaden/DugnadsinnkallingerPage'
import GroupListPage from 'modules/groups/GroupListPage'
import GroupPage from 'modules/groups/GroupPage'
import Home from 'modules/home/Home'
import UserListPage from 'modules/users/UserListPage'
import UserPage from 'modules/users/UserPage'
import React from 'react'
import { hot } from 'react-hot-loader/root'
import { Redirect, Route, Router } from 'react-router'
import history from 'utils/history'

const Todo = () => (
  <>
    <PageTitle title='TODO' />
    <p>TODO</p>
  </>
)

const Routes = () => (
  <>
    <Route exact path='/' component={Home} />

    <Route
      exact
      path='/arrplan'
      render={() => {
        const d = new Date()
        const sem =
          (d.getMonth() >= 6 ? 'h' : 'v') +
          d
            .getFullYear()
            .toString()
            .substr(2, 2)

        return <Redirect to={`/arrplan/${sem}`} />
      }}
    />
    <Route exact path='/arrplan/:sem' component={Todo} />

    <Route exact path='/login' component={Login} />
    <Route exact path='/registrer' component={Todo} />
    <Route exact path='/logout' component={Todo} />

    <Route exact path='/bokdatabase' component={Todo} />
    <Route exact path='/books' component={Todo} />
    <Route exact path='/books/register' component={Todo} />
    <Route exact path='/books/:id' component={Todo} />
    <Route exact path='/books/:id/edit' component={Todo} />

    <Route exact path='/bukker' component={Todo} />
    <Route exact path='/bukker/:id' component={Todo} />

    <Route
      exact
      path='/dugnaden/old/list'
      component={DugnadsinnkallingerPage}
    />

    <Route exact path='/googleapps' component={Todo} />

    <Route exact path='/groups' component={GroupListPage} />
    <Route exact path='/group/:name' component={GroupPage} />

    <Route exact path='/matmeny' component={Todo} />

    <Route exact path='/printer/siste' component={Todo} />
    <Route exact path='/printer/fakturere' component={Todo} />

    <Route exact path='/users' component={UserListPage} />
    <Route exact path='/user/:name' component={UserPage} />
  </>
)

const App = () => (
  <Router history={history}>
    <FlashesProvider>
      <TitleProvider>
        <>
          <PageTitle title='Foreningen Blindern Studenterhjem' />
          <UserProvider>
            <Template>
              <Routes />
            </Template>
          </UserProvider>
        </>
      </TitleProvider>
    </FlashesProvider>
  </Router>
)

const HotApp = hot(App)
export default HotApp
