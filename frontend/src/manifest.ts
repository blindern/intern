// Injected via vite during build.

declare const __BUILD_INFO__: {
  buildTime: string
  gitCommitShort: string
}

export const buildTime = __BUILD_INFO__.buildTime
export const gitCommitShort = __BUILD_INFO__.gitCommitShort
