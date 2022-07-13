export function groupUrl(groupName: string) {
  return `/group/${encodeURIComponent(groupName)}`
}

export function listGroupsUrl() {
  return "/groups"
}

export function userUrl(username: string) {
  return `/user/${encodeURIComponent(username)}`
}

export function listUsersUrl() {
  return "/users"
}

export function bukkUrl(id: string) {
  return `/bukker/${encodeURIComponent(id)}`
}

export function listBukkerUrl() {
  return "/bukker"
}

export function bookUrl(id: string) {
  return `/books/${encodeURIComponent(id)}`
}

export function editBookUrl(id: string) {
  return `/books/${encodeURIComponent(id)}/edit`
}

export function booksUrl() {
  return "/books"
}

export function registerBookUrl() {
  return "/books/register"
}
