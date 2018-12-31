import { get, post } from 'api'
import { BehaviorSubject } from 'rxjs'
import { AuthInfo, AuthInfoNotLoggedIn } from './types'

export const defaultAuthInfo: AuthInfoNotLoggedIn = {
  isLoggedIn: false,
  isUserAdmin: false,
  isOffice: false,
  csrfToken: null,
}

export class AuthService {
  authInfoSubject = new BehaviorSubject<AuthInfo>(defaultAuthInfo)

  markLoggedOut() {
    this.authInfoSubject.next(defaultAuthInfo)
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
    return data
  }

  async logout() {
    if (!this.authInfoSubject.value.isLoggedIn) {
      return
    }

    await post('logout')
    this.markLoggedOut()
  }
}
