# BOLAYETU Frontend — Dockerfile
#
# Build-only image: compiles the Vite static bundle. Nginx runs natively on
# the VPS (not in a container) and serves the extracted ./dist directory —
# see docker/nginx/by-frontend.vps.conf for the reference site config.

FROM node:20-alpine AS builder

WORKDIR /app

# Install ALL deps (devDependencies are needed for tsc + vite build)
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy source and build
COPY . .

# Build args passed at build time for environment
ARG VITE_API_BASE_URL
ARG VITE_API_URL
ARG VITE_APP_VERSION
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

RUN npm run build

# Default command copies the build output into a mounted /out volume; the
# by-frontend Compose project overrides this explicitly.
CMD ["sh", "-c", "rm -rf /out/* && cp -r /app/dist/. /out/"]

