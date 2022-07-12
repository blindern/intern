import { BrowserHistory } from 'history'
import {
  BadRequestError,
  ForbiddenError,
  NotAuthedError,
  NotFoundError,
  ResponseError,
  ServerError,
} from 'modules/core/api/errors'
import { api } from 'modules/core/api/utils'
import { AuthService } from 'modules/core/auth/AuthService'
import { FlashesService } from 'modules/core/flashes/FlahesService'

interface MessagesInError {
  messages: {
    type: 'danger' | 'success'
    message: string
  }[]
}

export class ApiService {
  private authService: AuthService

  constructor(
    readonly flashes: FlashesService,
    readonly history: BrowserHistory,
  ) {}

  setAuthService(authService: AuthService) {
    this.authService = authService
  }

  private async execute(url: string, options: RequestInit) {
    const response = await fetch(url, options)

    if (!response.ok) {
      if (response.status === 401) {
        this.authService.markLoggedOut()
        if (!this.history.location.pathname.endsWith('/login')) {
          this.flashes.addFlash({
            type: 'danger',
            message: 'Denne siden krever at du logger inn.',
          })
          this.authService.setLoginRedirectUrl(this.history.location.pathname)
          this.history.push('/intern/login')
        }
        throw new NotAuthedError(response)
      }

      if (response.status === 403) {
        throw new ForbiddenError(response)
      }

      if (response.status === 404) {
        throw new NotFoundError(response)
      }

      if (response.status >= 500) {
        throw new ServerError(response)
      }

      if (response.status === 400) {
        throw new BadRequestError(response)
      }

      throw new ResponseError(response)
    }

    return response
  }

  public async handleErrors2(error: ResponseError) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await error.response.json()

    let foundMessages = false

    if ('messages' in data) {
      for (const message of (data as MessagesInError).messages) {
        this.flashes.addFlash({
          type: message.type,
          message: message.message,
        })
        foundMessages = true
      }
    }

    if (foundMessages) {
      return
    }

    if (error instanceof ServerError) {
      this.flashes.addFlash({
        type: 'danger',
        message: 'Ukjent feil oppsto',
      })
    } else if (error instanceof ForbiddenError) {
      this.flashes.addFlash({
        type: 'danger',
        message: 'Du har ikke tilgang',
      })
    } else if (error instanceof NotFoundError) {
      this.flashes.addFlash({
        type: 'danger',
        message: 'Ressursen ble ikke funnet',
      })
    } else if (error instanceof BadRequestError) {
      this.flashes.addFlash({
        type: 'danger',
        message: 'Ukjent feil med verdiene som ble sendt',
      })
    } else {
      this.flashes.addFlash({
        type: 'danger',
        message: 'Ukjent feil',
      })
    }

    return
  }

  public async handleErrors(fn: () => Promise<Response>) {
    try {
      return await fn()
    } catch (e) {
      if (!(e instanceof ResponseError)) {
        throw e
      }

      await this.handleErrors2(e)
      throw e
    }
  }

  private fetchProps(includeCsrf: boolean): RequestInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      // we need to send this header so Larvel knows to send 401 and not 302
      'X-Requested-With': 'XMLHttpRequest',
    }

    if (includeCsrf) {
      headers['X-CSRF-TOKEN'] =
        this.authService.getAuthInfoObservable().value.csrfToken ?? ''
    }

    const result: RequestInit = {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers,
    }

    return result
  }

  public get(path: string) {
    // This don't use handleErrors. The caller should handle that for GET.
    return this.execute(api(path), {
      method: 'GET',
      ...this.fetchProps(false),
    })
  }

  public post(path: string, data?: unknown) {
    return this.handleErrors(async () =>
      this.execute(api(path), {
        method: 'POST',
        ...this.fetchProps(true),
        body: data != null ? JSON.stringify(data) : null,
      }),
    )
  }

  public put(path: string, data?: unknown) {
    return this.handleErrors(async () =>
      this.execute(api(path), {
        method: 'PUT',
        ...this.fetchProps(true),
        body: data != null ? JSON.stringify(data) : null,
      }),
    )
  }

  public delete(path: string) {
    return this.handleErrors(async () =>
      this.execute(api(path), {
        method: 'DELETE',
        ...this.fetchProps(true),
      }),
    )
  }

  public upload(path: string, body: FormData) {
    return this.handleErrors(async () =>
      this.execute(api(path), {
        method: 'POST',
        ...this.fetchProps(true),
        body,
      }),
    )
  }
}
