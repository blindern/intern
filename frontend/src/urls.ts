export function userUrl(username: string) {
  return `/user/${encodeURIComponent(username)}`
}

export function bukkUrl(id: string) {
  return `/bukker/${encodeURIComponent(id)}`
}
