import { BrowserHistory } from "history"
import {
  BadRequestError,
  ForbiddenError,
  NotAuthedError,
  NotFoundError,
  ResponseError,
  ServerError,
} from "modules/core/api/errors.js"
import { api } from "modules/core/api/utils.js"
import { AuthService } from "modules/core/auth/AuthService.js"
import {
  FlashArgs,
  FlashesService,
} from "modules/core/flashes/FlahesService.js"

interface MessagesInError {
  messages: {
    type: "danger" | "success"
    message: string
  }[]
}

export class ApiService {
  private authService: AuthService | undefined

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
      let data
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data = await response.json()
      } catch (e) {
        data = null
      }

      let messages: FlashArgs[] = []
      if (data && "messages" in data) {
        const data2 = data as MessagesInError
        if (data2.messages.length > 0) {
          messages = data2.messages.map<FlashArgs>((message) => ({
            type: message.type,
            message: message.message,
          }))
        }
      }

      if (response.status === 401) {
        this.authService!.markLoggedOut()
        throw new NotAuthedError(response, messages, data)
      }

      if (response.status === 403) {
        throw new ForbiddenError(response, messages, data)
      }

      if (response.status === 404) {
        throw new NotFoundError(response, messages, data)
      }

      if (response.status >= 500) {
        throw new ServerError(response, messages, data)
      }

      if (response.status === 400) {
        throw new BadRequestError(response, messages, data)
      }

      throw new ResponseError(response, messages, data)
    }

    return response
  }

  public errorToMessages(error: ResponseError): FlashArgs[] {
    if (error.messages.length > 0) {
      return error.messages
    }

    if (error instanceof NotAuthedError) {
      return [
        {
          type: "danger",
          message: "Pålogging kreves",
        },
      ]
    } else if (error instanceof ServerError) {
      return [
        {
          type: "danger",
          message: "Ukjent feil oppsto",
        },
      ]
    } else if (error instanceof ForbiddenError) {
      return [
        {
          type: "danger",
          message: "Du har ikke tilgang",
        },
      ]
    } else if (error instanceof NotFoundError) {
      return [
        {
          type: "danger",
          message: "Ressursen ble ikke funnet",
        },
      ]
    } else if (error instanceof BadRequestError) {
      return [
        {
          type: "danger",
          message: "Ukjent feil med verdiene som ble sendt",
        },
      ]
    } else {
      return [
        {
          type: "danger",
          message: `Ukjent feil: ${String(error)}`,
        },
      ]
    }
  }

  public async handleErrors(fn: () => Promise<Response>) {
    try {
      return await fn()
    } catch (e) {
      if (!(e instanceof ResponseError)) {
        throw e
      }

      for (const message of this.errorToMessages(e)) {
        this.flashes.addFlash(message)
      }

      throw e
    }
  }

  private fetchProps(includeCsrf: boolean): RequestInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // we need to send this header so Larvel knows to send 401 and not 302
      "X-Requested-With": "XMLHttpRequest",
    }

    if (includeCsrf) {
      headers["X-CSRF-TOKEN"] =
        this.authService!.getAuthInfoObservable().value.data.csrfToken ?? ""
    }

    const result: RequestInit = {
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers,
    }

    return result
  }

  public get(path: string) {
    // This don't use handleErrors. The caller should handle that for GET.
    return this.execute(api(path), {
      method: "GET",
      ...this.fetchProps(false),
    })
  }

  public post(path: string, data?: unknown) {
    return this.handleErrors(async () =>
      this.execute(api(path), {
        method: "POST",
        ...this.fetchProps(true),
        body: data != null ? JSON.stringify(data) : null,
      }),
    )
  }

  public put(path: string, data?: unknown) {
    return this.handleErrors(async () =>
      this.execute(api(path), {
        method: "PUT",
        ...this.fetchProps(true),
        body: data != null ? JSON.stringify(data) : null,
      }),
    )
  }

  public delete(path: string) {
    return this.handleErrors(async () =>
      this.execute(api(path), {
        method: "DELETE",
        ...this.fetchProps(true),
      }),
    )
  }

  public upload(path: string, body: FormData) {
    return this.handleErrors(async () =>
      this.execute(api(path), {
        method: "POST",
        ...this.fetchProps(true),
        body,
      }),
    )
  }
}
