FROM node:24-alpine@sha256:b0d33ed19a912e1a18ceb83e139815233cd49c123fe025e67a7c506c93e3f728 AS base
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
