import { ApiService } from "modules/core/api/ApiService"
import { api } from "modules/core/api/utils"
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
  private shouldLogoutSubject = new BehaviorSubject(false)

  constructor(readonly api: ApiService) {}

  markLoggedOut() {
    const isLoggedOut = this.authInfoSubject.value.data.isLoggedIn

    this.authInfoSubject.next(defaultAuthInfo)
    if (isLoggedOut) {
      this.possiblyLoggedOutSubject.next()
    }

    // Refetch auth info to get fresh csrf token.
    // TODO: Handle rejection.
    void this.fetchAuthInfo()
  }

  getAuthInfoObservable = () => this.authInfoSubject
  getPossiblyLoggedOutObservable = () => this.possiblyLoggedOutSubject
  getShouldLogoutObservable = () => this.shouldLogoutSubject

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

  logout() {
    // See component in AuthServiceProvider.
    this.shouldLogoutSubject.next(true)
  }

  getLoginUrl() {
    return api(
      `saml2/login?returnTo=${encodeURIComponent(window.location.href)}`,
    )
  }

  getLogoutUrl() {
    return api(
      `saml2/logout?_token=${encodeURIComponent(
        this.authInfoSubject.value.data.csrfToken ?? "",
      )}&returnTo=${encodeURIComponent(
        window.location.protocol + "//" + window.location.host + "/intern/",
      )}`,
    )
  }
}
