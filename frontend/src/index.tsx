import domready from 'domready'
import React from 'react'
import ReactDOM from 'react-dom'
import { hot } from 'react-hot-loader/root'
import { Route } from 'react-router'
import { BrowserRouter, Link } from 'react-router-dom'

import { buildTime, gitCommitShort } from './manifest'

const commitLink = `https://github.com/blindern/intern/commit/${gitCommitShort}`

console.info(
  `Blindern intern\n` +
    `- built ${buildTime}\n` +
    `- from Git commit ${gitCommitShort}: ${commitLink}`,
)

const App = () => (
  <BrowserRouter>
    <>
      <Route exact path='/' render={() => <p>Hei!</p>} />
      <Route exact path='/test' render={() => <p>Ja!!</p>} />
    </>
  </BrowserRouter>
)

const HotApp = hot(App)

domready(() => {
  ReactDOM.render(<HotApp />, document.getElementById('react_container'))
})
