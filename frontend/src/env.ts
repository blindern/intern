// Allow injecting properties during runtime.
// The index.html loads a special env.js before the application boots.

declare var window: any

export const BACKEND_URL: string = window.BACKEND_URL
