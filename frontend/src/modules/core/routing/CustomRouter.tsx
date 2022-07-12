import { BrowserHistory } from 'history'
import React, { ReactNode, useLayoutEffect, useState } from 'react'
import { Router } from 'react-router-dom'

// The CustomRouter allows us to keep a reference to history outside of it.

export function CustomRouter({
  history,
  basename,
  children,
}: {
  history: BrowserHistory
  basename: string
  children: ReactNode
}) {
  const [state, setState] = useState({
    action: history.action,
    location: history.location,
  })
  useLayoutEffect(() => history.listen(setState), [history])
  return (
    <Router
      basename={basename}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    >
      {children}
    </Router>
  )
}
