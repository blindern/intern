FROM node:24-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 AS base
WORKDIR /app

FROM base AS install
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod

FROM base AS build
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM base AS release
RUN apk add --no-cache antiword
COPY --from=install /app/node_modules node_modules
COPY --from=build /app/dist dist
COPY --from=build /app/drizzle drizzle
COPY serve.js migrate.js instrumentation.ts ./

ENV OTEL_SERVICE_NAME=intern-app
ENV OTEL_TRACES_EXPORTER=otlp
ENV OTEL_METRICS_EXPORTER=none
ENV OTEL_LOGS_EXPORTER=none
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://signoz-otel-collector.zt.foreningenbs.no:4318

USER node
EXPOSE 3000
ENTRYPOINT ["sh", "-c", "node migrate.js && node --import ./instrumentation.ts serve.js"]
