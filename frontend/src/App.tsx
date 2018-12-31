import Template from 'layout/Template'
import Login from 'modules/core/auth/Login'
import UserProvider from 'modules/core/auth/UserProvider'
import FlashesProvider from 'modules/core/flashes/FlashesProvider'
import { PageTitle } from 'modules/core/title/PageTitle'
import TitleProvider from 'modules/core/title/TitleProvider'
import Home from 'modules/home/Home'
import React from 'react'
import { hot } from 'react-hot-loader/root'
import { Redirect, Route } from 'react-router'
import { BrowserRouter } from 'react-router-dom'

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

    <Route exact path='/dugnaden/old/list' component={Todo} />

    <Route exact path='/googleapps' component={Todo} />

    <Route exact path='/groups' component={Todo} />
    <Route exact path='/group/:name' component={Todo} />

    <Route exact path='/matmeny' component={Todo} />

    <Route exact path='/printer/siste' component={Todo} />
    <Route exact path='/printer/fakturere' component={Todo} />

    <Route exact path='/users' component={Todo} />
    <Route exact path='/user/:name' component={Todo} />
  </>
)

const App = () => (
  <BrowserRouter basename='/intern'>
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
  </BrowserRouter>
)

const HotApp = hot(App)
export default HotApp
