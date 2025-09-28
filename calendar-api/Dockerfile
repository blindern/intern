FROM node:24-alpine@sha256:77f3c4d1f33c17dfa4af4b0add57d86957187873e313c2c37f52831d117645c8 AS base
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
