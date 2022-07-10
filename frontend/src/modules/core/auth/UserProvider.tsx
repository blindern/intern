import React from 'react'
import { Subscription } from 'rxjs'
import { authService } from '.'
import { defaultAuthInfo } from './AuthService'
import { AuthInfo } from './types'

export const AuthContext = React.createContext<AuthInfo>(defaultAuthInfo)

interface Props {
  children: React.ReactNode
}

class UserProvider extends React.Component<Props> {
  subscriber?: Subscription

  state = {
    data: defaultAuthInfo,
  }

  componentDidMount() {
    this.subscriber = authService
      .getUserDataObservable()
      .subscribe((userInfo) => {
        this.setState({
          data: userInfo,
        })
      })

    // TODO: Handle rejection.
    void authService.fetchAuthInfo()
  }

  componentWillUnmount() {
    if (this.subscriber) this.subscriber.unsubscribe()
  }

  render() {
    return (
      <AuthContext.Provider value={this.state.data}>
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

export default UserProvider
