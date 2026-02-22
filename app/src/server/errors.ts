/**
 * Expected/client errors that should be logged at warn level,
 * not error level. These are normal operational responses
 * (auth required, forbidden, not found, validation failures)
 * as opposed to unexpected server failures.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AppError"
  }
}
