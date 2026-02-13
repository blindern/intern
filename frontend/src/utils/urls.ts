export function homeUrl() {
  return "/"
}

export function arrplanUrl() {
  return "/arrplan"
}

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

export function listBooksUrl() {
  return "/books"
}

export function registerBookUrl() {
  return "/books/register"
}

export function dugnadsinnkallingerUrl() {
  return "/dugnaden/old/list"
}

export function lastPrintsUrl() {
  return "/printer/siste"
}

export function printerInvocingUrl() {
  return "/printer/fakturere"
}

export function matmenyUrl() {
  return "/matmeny"
}

export function registerUserUrl() {
  return "/register"
}

export function registrationRequestsUrl() {
  return "/users/registrations"
}

export function changePasswordUrl() {
  return "/change-password"
}

export function forgotPasswordUrl() {
  return "/forgot-password"
}

export function resetPasswordUrl() {
  return "/reset-password"
}
