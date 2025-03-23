import ReactDOM from "react-dom/client"
import { StrictMode } from "react"
import { App } from "./App.js"

import { buildTime, gitCommitShort } from "./manifest.js"

import "./jquery-hack.js"

import "bootstrap-sass/assets/javascripts/bootstrap"

const commitLink = `https://github.com/blindern/intern/commit/${gitCommitShort}`

console.info(
  `Blindern intern\n` +
    `- built ${buildTime}\n` +
    `- from Git commit ${gitCommitShort}: ${commitLink}`,
)

ReactDOM.createRoot(document.getElementById("react_container")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
