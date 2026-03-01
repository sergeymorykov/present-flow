# syntax=docker/dockerfile:1

# ---- Build stage: compile Vite app into /dist ----
FROM node:20-alpine AS build

WORKDIR /app

# Vite reads VITE_* only at build time
ARG VITE_CPP_COMPILER_URL
ENV VITE_CPP_COMPILER_URL=${VITE_CPP_COMPILER_URL}

# Install dependencies using lockfile for reproducible builds
COPY package*.json ./
RUN npm ci

# Copy source and build production bundle
COPY . .
RUN npm run build


# ---- Runtime stage: lightweight static server ----
FROM nginx:alpine AS runtime

# Default port for internal HTTP traffic (host handles HTTPS)
ENV PORT=5000

# Use nginx template + env var to keep port configurable
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Copy only built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 5000

