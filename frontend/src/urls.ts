export function userUrl(username: string) {
  return `/user/${encodeURIComponent(username)}`
}
