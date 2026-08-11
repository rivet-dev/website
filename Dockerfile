# Website Astro Dockerfile
# Multi-stage build: Node.js for building, Caddy for serving

# =============================================================================
# Stage 1: Build
# =============================================================================
# Use Debian-based Node image (required for Playwright/mermaid rendering)
FROM node:22-bookworm AS builder

# Install pnpm — pin to the repo's packageManager version (NOT @latest). pnpm 11
# makes ERR_PNPM_IGNORED_BUILDS fatal (esbuild/sharp/core-js build scripts).
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

# The website is its own repo now: the MDX pipeline is inlined under src/mdx and
# src/integrations, and @rivet-gg/components + icons + shared-data live in
# packages/. There is no external theme to clone and no monorepo to assemble.
COPY . .

# Arguments required before installing dependencies
ARG FONTAWESOME_PACKAGE_TOKEN=""
ENV FONTAWESOME_PACKAGE_TOKEN=${FONTAWESOME_PACKAGE_TOKEN}

# Install dependencies (with pnpm store cache).
#
# Railway scopes build caches per service and rejects any cache mount whose id
# is not prefixed with that service's own key, so the uuid below is this
# service's id and not a value that can be shared or invented. Recreating the
# Railway service changes it, and the build then fails at parse time with
# "missing the cacheKey prefix from its id". Read the current one from the
# service's RAILWAY_SERVICE_ID variable and update this line to match. Other
# builders ignore the id, so it is inert outside Railway.
RUN --mount=type=cache,id=s/d133ea35-d9c8-4da7-a34c-b115adf85a9e-/pnpm/store,target=/pnpm/store \
    pnpm install --no-frozen-lockfile

# Build arguments for PUBLIC_* environment variables
ARG PUBLIC_SITE_URL="https://rivet.dev"
ARG PUBLIC_POSTHOG_KEY=""
ARG PUBLIC_POSTHOG_HOST=""
ARG PUBLIC_TYPESENSE_HOST=""
ARG PUBLIC_TYPESENSE_API_KEY=""

# Set environment variables for build
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
ENV PUBLIC_POSTHOG_KEY=${PUBLIC_POSTHOG_KEY}
ENV PUBLIC_POSTHOG_HOST=${PUBLIC_POSTHOG_HOST}
ENV PUBLIC_TYPESENSE_HOST=${PUBLIC_TYPESENSE_HOST}
ENV PUBLIC_TYPESENSE_API_KEY=${PUBLIC_TYPESENSE_API_KEY}

# Build the website (static export to 'dist'). prebuild runs scripts/assemble.ts,
# which has no sibling checkouts in the image and therefore links each product's
# docs to its committed vendor/<product> bundle.
RUN pnpm run build

# Generate the Caddy redirect snippet from the shared redirect map
RUN node scripts/generate-caddy-redirects.mjs

# =============================================================================
# Stage 2: Serve with Caddy
# =============================================================================
# Pin to caddy 2.x: the redirect snippet uses {http.request.uri.prefixed_query},
# which requires Caddy >= 2.8.
FROM caddy:2-alpine

# Copy Caddyfile configuration and the generated redirect snippet (imported by
# the Caddyfile relative to its own directory)
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/redirects.caddy /etc/caddy/redirects.caddy

# Copy built files from builder stage
COPY --from=builder /app/dist /srv

# Fail the build on a broken config instead of crash-looping at runtime
RUN caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

# Default port (platform injects PORT env var)
ENV PORT=80

# Caddy automatically reads PORT from environment
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
