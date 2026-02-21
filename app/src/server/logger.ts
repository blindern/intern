import { trace } from "@opentelemetry/api"
import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  mixin() {
    const span = trace.getActiveSpan()
    if (!span) return {}
    const { traceId, spanId } = span.spanContext()
    return { trace_id: traceId, span_id: spanId }
  },
})
