// Injected via vite during build.

declare var __BUILD_INFO__: any

export const buildTime = __BUILD_INFO__.buildTime
export const gitCommitShort = __BUILD_INFO__.gitCommitShort

