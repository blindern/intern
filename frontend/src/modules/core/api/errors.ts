import { FlashArgs } from "modules/core/flashes/FlahesService.js"

export class ResponseError extends Error {
  constructor(
    readonly response: Response,
    readonly messages: FlashArgs[],
    readonly json: unknown,
  ) {
    super(response.statusText)
  }
}
export class NotAuthedError extends ResponseError {}
export class NotFoundError extends ResponseError {}
export class ForbiddenError extends ResponseError {}
export class ServerError extends ResponseError {}
export class BadRequestError extends ResponseError {}
