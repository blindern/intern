import { BACKEND_URL } from 'env'
import { authService } from 'modules/core/auth'
import { flashesService } from 'modules/core/flashes';

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

const doFetch = async (url: string, options: RequestInit) => {
  const result = await fetch(url, options)

  const flashes = result.headers.get('X-Flashes')
  if (flashes != null) {
    const json = JSON.parse(flashes) as Array<{
      message: string
      type?: 'danger' | null
    }>

    json.forEach(flash => {
      flashesService.addFlash(flash)
    })
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
    },
    body: data != null ? JSON.stringify(data) : null,
  })
