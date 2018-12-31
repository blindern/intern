import domready from 'domready'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { buildTime, gitCommitShort } from './manifest'

import './jquery-hack'

import 'bootstrap-sass/assets/javascripts/bootstrap'

const commitLink = `https://github.com/blindern/intern/commit/${gitCommitShort}`

console.info(
  `Blindern intern\n` +
    `- built ${buildTime}\n` +
    `- from Git commit ${gitCommitShort}: ${commitLink}`,
)

domready(() => {
  ReactDOM.render(<App />, document.getElementById('react_container'))
})
