export class ResponseError extends Error {
  constructor(readonly response: Response) {
    super(response.statusText)
  }
}
export class NotAuthedError extends ResponseError {}
export class NotFoundError extends ResponseError {}
export class ForbiddenError extends ResponseError {}
export class ServerError extends ResponseError {}
export class BadRequestError extends ResponseError {}
