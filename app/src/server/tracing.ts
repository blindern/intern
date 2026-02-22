import { createMiddleware } from "@tanstack/react-start"
import { trace, SpanStatusCode } from "@opentelemetry/api"
import { logger } from "./logger.js"

export const tracer = trace.getTracer("intern-app")

const SENSITIVE_PARAMS = new Set(["token", "key", "password", "secret"])

function redactUrl(rawUrl: string): string {
  const url = new URL(rawUrl)
  for (const key of url.searchParams.keys()) {
    if (SENSITIVE_PARAMS.has(key.toLowerCase())) {
      url.searchParams.set(key, "[REDACTED]")
    }
  }
  return url.toString()
}

export const tracingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const url = new URL(request.url)

    return tracer.startActiveSpan(
      `${request.method} ${url.pathname}`,
      async (span) => {
        span.setAttributes({
          "http.method": request.method,
          "http.url": redactUrl(request.url),
          "http.route": url.pathname,
        })

        try {
          const result = await next()
          span.setStatus({ code: SpanStatusCode.OK })
          return result
        } catch (error) {
          logger.error(
            { err: error, route: url.pathname },
            "server function error",
          )
          span.recordException(error as Error)
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: (error as Error).message,
          })
          throw error
        } finally {
          span.end()
        }
      },
    )
  },
)
