import { createMiddleware } from "@tanstack/react-start"
import { trace, SpanStatusCode } from "@opentelemetry/api"

export const tracer = trace.getTracer("intern-app")

/**
 * Middleware that traces server function requests with OpenTelemetry.
 */
export const tracingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const url = new URL(request.url)

    return tracer.startActiveSpan(
      `${request.method} ${url.pathname}`,
      async (span) => {
        span.setAttributes({
          "http.method": request.method,
          "http.url": request.url,
          "http.route": url.pathname,
        })

        try {
          const result = await next()
          span.setStatus({ code: SpanStatusCode.OK })
          return result
        } catch (error) {
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
