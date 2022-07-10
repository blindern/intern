import { authService } from 'modules/core/auth'
import { flashesService } from 'modules/core/flashes'
import { DependencyList, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

let backendUrl = BACKEND_URL

if (backendUrl.indexOf('SAMEHOST') !== -1) {
  backendUrl = backendUrl.replace('SAMEHOST', window.location.hostname)
}

// if using default port used for webpack, assume backend is at port 8081
if (backendUrl === '/intern/' && window.location.port === '3000') {
  backendUrl =
    window.location.protocol + '//' + window.location.hostname + ':8081/intern/'
}

if (backendUrl.indexOf('//') === -1) {
  const seperator = backendUrl.substring(0, 1) === '/' ? '' : '/'
  backendUrl = window.location.origin + seperator + backendUrl
}

export const api = (url: string) => backendUrl + 'api/' + url // see webpack config

export class NotAuthedError extends Error {}
export class NotFoundError extends Error {}

const doFetch = async (url: string, options: RequestInit) => {
  const result = await fetch(url, options)

  const flashes = result.headers.get('X-Flashes')
  if (flashes != null) {
    const json = JSON.parse(flashes) as Array<{
      message: string
      type?: 'danger' | null
    }>

    json.forEach((flash) => {
      flashesService.addFlash(flash)
    })
  }

  if (!result.ok) {
    if (result.status === 401) {
      throw new NotAuthedError()
    }

    if (result.status === 404) {
      throw new NotFoundError()
    }

    throw Error(`Response not OK: ${result.status}`)
  }

  return result
}

export const get = (path: string) =>
  doFetch(api(path), {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      // we need to send this header so Larvel knows to send 401 and not 302
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

export const post = (path: string, data?: any) =>
  doFetch(api(path), {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': authService.getUserDataObservable().value.csrfToken || '',
      // we need to send this header so Larvel knows to send 401 and not 302
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: data != null ? JSON.stringify(data) : null,
  })

// TODO: Handle not found and errors
export function useApiFetcher<T>(
  fetcher: () => Promise<T>,
  inputs: DependencyList,
): T | null {
  const location = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState<T | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const result = await fetcher()
        if (!cancelled) setResult(result)
      } catch (e) {
        if (cancelled) return

        if (e instanceof NotAuthedError) {
          authService.setLoginRedirectUrl(location.pathname)
          navigate('/login')
        } else {
          throw e
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, inputs)

  return result
}
