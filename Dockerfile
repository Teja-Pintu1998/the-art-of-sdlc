# The Art of SDLC: production image (AOS-1.6). Multi-stage, so the final image holds only what
# runs the site: no compilers, tests or dev dependencies. Built, scanned and pushed by
# .github/workflows/docker.yml, tagged with the Git commit SHA.

# 1. Install exact dependency versions from the lockfile.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# 2. Build the standalone Next.js server.
FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. The runtime image: slim, non-root.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
# Lessons are read from disk for station addresses that aren't pre-built (they return 404).
COPY --from=build --chown=app:app /app/content ./content
USER app
EXPOSE 3000
CMD ["node", "server.js"]
