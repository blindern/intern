FROM node:24-alpine@sha256:10d711afd59d7025ccc97fc4f1f78be8588a5f025d3a8b179af64f6720f5d99b AS base
WORKDIR /app

FROM base AS install

RUN mkdir -p /temp/prod
RUN corepack enable
COPY package.json pnpm-lock.yaml /temp/prod/
RUN cd /temp/prod && pnpm install --prod

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY src src

USER node
EXPOSE 8000
ENTRYPOINT ["node", "src/index.ts"]
