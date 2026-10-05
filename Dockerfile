# syntax=docker/dockerfile:1
ARG BUN_VERSION=1.4.0

FROM oven/bun:${BUN_VERSION}-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY shared/package.json ./shared/package.json
RUN bun install --frozen-lockfile
COPY backend ./backend
COPY frontend ./frontend
COPY shared ./shared
# Explicitly install the platform-specific schema engine, even if Bun blocks
# dependency lifecycle scripts. Deployment never downloads migration tooling.
RUN bun node_modules/@prisma/engines/scripts/postinstall.js
RUN cd backend && bun run --bun generate
RUN cd shared && bun run --bun build-types
RUN cd backend && bun build src/server.ts --compile --sourcemap --outfile ../build/server

ARG VITE_DISCORD_ID
ARG VITE_ERROR_WEBHOOK
ARG UMAMI_URL
ARG UMAMI_WEBSITE_ID
ARG UMAMI_STAGE_WEBSITE_ID
RUN cd frontend && NODE_ENV=production VITE_DISCORD_ID="${VITE_DISCORD_ID}" \
    VITE_ERROR_WEBHOOK="${VITE_ERROR_WEBHOOK}" VITE_UMAMI_URL="${UMAMI_URL}" \
    VITE_UMAMI_WEBSITE_ID="${UMAMI_WEBSITE_ID}" VITE_UMAMI_STAGE_WEBSITE_ID="${UMAMI_STAGE_WEBSITE_ID}" \
    bun run --bun build-only

FROM oven/bun:${BUN_VERSION}-alpine AS migrations
WORKDIR /app
COPY docker/migrations/package.json docker/migrations/bun.lock ./
RUN bun install --frozen-lockfile --production \
    && bun node_modules/@prisma/engines/scripts/postinstall.js

# The pinned base already includes libstdc++ and OpenSSL 3 shared libraries.
FROM oven/bun:${BUN_VERSION}-alpine AS release
ENV NODE_ENV=production \
    frontendPath=/build/frontend
WORKDIR /app
COPY --from=migrations /app/node_modules ./node_modules
COPY --from=migrations /app/package.json ./package.json
COPY backend/prisma.config.ts ./prisma.config.ts
COPY backend/src/prisma ./src/prisma
COPY --from=builder /app/build /build
# The existing logger writes relative to the working directory.
RUN mkdir logs && chown bun:bun logs
USER bun
EXPOSE 5000
CMD ["/build/server"]
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=10s \
    CMD ["bun", "--eval", "fetch('http://127.0.0.1:' + (process.env.port || '5000') + '/api/health', { signal: AbortSignal.timeout(4000), redirect: 'error' }).then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
