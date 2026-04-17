# ─── Stage 1: Build React frontend ───────────────────────────────────────────
FROM node:20-alpine AS client-builder

WORKDIR /build/client

COPY client/package*.json ./
RUN npm ci --prefer-offline

COPY client/ .
RUN npm run build

# ─── Stage 2: Install server production deps ─────────────────────────────────
FROM node:20-alpine AS server-deps

WORKDIR /build/server

COPY server/package*.json ./
RUN npm ci --omit=dev --prefer-offline

# ─── Stage 3: Final runtime image ────────────────────────────────────────────
FROM node:20-alpine AS runtime

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy compiled React build
COPY --from=client-builder /build/client/dist ./client/dist

# Copy server source and production node_modules
COPY --from=server-deps   /build/server/node_modules ./server/node_modules
COPY server/              ./server/

# Fargate/ECS expects containers to run as non-root
USER appuser

EXPOSE 3000

# Tini handles PID 1 / signal forwarding (Alpine ships it as optional)
# Use node directly — fine for Fargate single-process containers
ENV NODE_ENV=production \
    PORT=3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server/src/index.js"]
