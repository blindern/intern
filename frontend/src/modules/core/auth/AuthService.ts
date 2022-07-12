import { ApiService } from "modules/core/api/ApiService"
import { BehaviorSubject, Subject } from "rxjs"
import { AuthInfo, Me } from "./types"

export const defaultAuthInfo: AuthInfo = {
  isLoading: true,
  isError: false,
  error: null,
  data: {
    isLoggedIn: false,
    isUserAdmin: false,
    isOffice: false,
    csrfToken: null,
  },
}

export class AuthService {
  private authInfoSubject = new BehaviorSubject<AuthInfo>(defaultAuthInfo)
  private possiblyLoggedOutSubject = new Subject<void>()
  private loginRedirectUrl: string | null = null

  constructor(readonly api: ApiService) {}

  markLoggedOut() {
    this.authInfoSubject.next(defaultAuthInfo)
    this.possiblyLoggedOutSubject.next()

    // Refetch auth info to get fresh csrf token.
    // TODO: Handle rejection.
    void this.fetchAuthInfo()
  }

  getAuthInfoObservable = () => this.authInfoSubject
  getPossiblyLoggedOutObservable = () => this.possiblyLoggedOutSubject

  async fetchAuthInfo() {
    try {
      const response = await this.api.get("me")
      const authInfo = (await response.json()) as Me
      this.authInfoSubject.next({
        isLoading: false,
        isError: false,
        error: null,
        data: authInfo,
      })
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e
      }

      this.authInfoSubject.next({
        isLoading: false,
        isError: true,
        error: e,
        data: this.authInfoSubject.value.data,
      })
    }
  }

  async login(username: string, password: string, rememberMe: boolean) {
    const response = await this.api.post("login", {
      username,
      password,
      remember_me: rememberMe,
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = await response.json()

    if (!("user" in json)) {
      throw Error("Unexpected response")
    }

    const data = json as Me
    this.authInfoSubject.next({
      isLoading: false,
      isError: false,
      error: null,
      data,
    })

    if (this.loginRedirectUrl != null) {
      window.location.assign(this.loginRedirectUrl)
      this.loginRedirectUrl = null
    }

    return data
  }

  async logout() {
    if (!this.authInfoSubject.value.data.isLoggedIn) {
      return
    }

    await this.api.post("logout")
    this.markLoggedOut()
  }

  setLoginRedirectUrl(pathname: string) {
    this.loginRedirectUrl = pathname
  }
}
