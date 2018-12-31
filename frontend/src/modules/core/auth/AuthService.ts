import { get, post } from 'api'
import { BehaviorSubject } from 'rxjs'
import history from 'utils/history'
import { AuthInfo, AuthInfoNotLoggedIn } from './types'

export const defaultAuthInfo: AuthInfoNotLoggedIn = {
  isLoggedIn: false,
  isUserAdmin: false,
  isOffice: false,
  csrfToken: null,
}

export class AuthService {
  private authInfoSubject = new BehaviorSubject<AuthInfo>(defaultAuthInfo)
  private loginRedirectUrl: string | null = null

  markLoggedOut() {
    this.authInfoSubject.next(defaultAuthInfo)

    // Refetch auth info to get fresh csrf token.
    this.fetchAuthInfo()
  }

  getUserDataObservable = () => this.authInfoSubject

  async fetchAuthInfo() {
    const response = await get('me')
    const authInfo: AuthInfo = await response.json()

    this.authInfoSubject.next(authInfo)
  }

  async login(username: string, password: string, rememberMe: boolean) {
    const response = await post('login', {
      username,
      password,
      remember_me: rememberMe,
    })

    const json = await response.json()

    if (!('user' in json)) {
      throw Error('Unexpected response')
    }

    const data = json as AuthInfo
    this.authInfoSubject.next(data)

    if (this.loginRedirectUrl != null) {
      console.log('redirect to ' + this.loginRedirectUrl)
      history.push(this.loginRedirectUrl)
      this.loginRedirectUrl = null
    }

    return data
  }

  async logout() {
    if (!this.authInfoSubject.value.isLoggedIn) {
      return
    }

    await post('logout')
    this.markLoggedOut()
  }

  setLoginRedirectUrl(pathname: string) {
    this.loginRedirectUrl = pathname
  }
}
