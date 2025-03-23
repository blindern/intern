let backendUrl = BACKEND_URL

if (backendUrl.includes("SAMEHOST")) {
  backendUrl = backendUrl.replace("SAMEHOST", window.location.hostname)
}

// if using default port used for webpack, assume backend is at port 8081
if (backendUrl === "/intern/" && window.location.port === "3000") {
  backendUrl =
    window.location.protocol + "//" + window.location.hostname + ":8081/intern/"
}

if (!backendUrl.includes("//")) {
  const seperator = backendUrl.startsWith("/") ? "" : "/"
  backendUrl = window.location.origin + seperator + backendUrl
}

export const api = (url: string) => backendUrl + "api/" + url // see webpack config
