# use the official Bun image
FROM oven/bun:latest AS base

# Set environment variables
ENV NODE_ENV=production
ARG VITE_DISCORD_ID
ENV VITE_DISCORD_ID=${VITE_DISCORD_ID}
ARG VITE_ERROR_WEBHOOK
ENV VITE_ERROR_WEBHOOK=${VITE_ERROR_WEBHOOK}
ARG UMAMI_URL
ENV VITE_UMAMI_URL=${UMAMI_URL}
ARG UMAMI_WEBSITE_ID
ENV VITE_UMAMI_WEBSITE_ID=${UMAMI_WEBSITE_ID}

# Set the working directory in the containter
WORKDIR /app

# Copy source

COPY . .

# Build app

## Install dependencies
RUN bun install --production

## Generate prisma types
RUN cd backend && bun run generate

## Build shared type interface
RUN cd shared && bun run build-types

## Build backend
RUN cd backend && bun build src/server.ts --compile --sourcemap --outfile ../build/server

## Build frontend
RUN cd frontend && bun run build-only

FROM base AS release

# Set output working directory
WORKDIR /build

# Copy output to container
COPY --from=base /app/build .

# Expose backend port
EXPOSE 5000

# Run server when container launches
CMD ["./server"]

# Health check
RUN apt update && apt install curl -y
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=5s CMD curl --fail http://localhost:5000/ || exit 1