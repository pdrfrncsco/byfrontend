# BOLAYETU Frontend — Dockerfile
# Skill: BOLAYETU_DOCKER_DEVOPS_SKILL
#
# Multi-stage:
#   Stage 1 (builder):  Install deps & build Vite static assets
#   Stage 2 (runtime):  Nginx serves built assets
#
# Frontend is served as static files through Nginx.
# Tenant resolution happens client-side via window.location.hostname.


# ─── Stage 1: Builder ────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (use ci for reproducible installs)
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Copy source and build
COPY . .

# Build args passed at build time for environment
ARG VITE_API_URL
ARG VITE_APP_VERSION
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

RUN npm run build


# ─── Stage 2: Nginx Runtime ──────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for SPA routing
COPY docker/nginx/spa.conf /etc/nginx/conf.d/spa.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
