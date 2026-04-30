FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_CPP_COMPILER_URL
ARG NODE_BUILD_MEMORY=2048
ENV VITE_CPP_COMPILER_URL=${VITE_CPP_COMPILER_URL}
ENV NODE_OPTIONS="--max-old-space-size=${NODE_BUILD_MEMORY}"
ENV CI=true

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci --no-audit --no-fund --prefer-offline

COPY . .
RUN npm run build \
  && find dist -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" -o -name "*.json" \) \
       -exec gzip -9 -k {} \;
  
FROM nginx:alpine AS runtime
  
ENV PORT=5000

RUN apk add --no-cache wget
  
LABEL maintainer="rebbit123456@gmail.com"
LABEL version="1.0.0"
LABEL description="Present Flow Frontend"
  
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R 101:101 /usr/share/nginx/html && \
    chown -R 101:101 /var/cache/nginx && \
    chown -R 101:101 /var/log/nginx && \
    chown -R 101:101 /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R 101:101 /var/run/nginx.pid
  
USER nginx

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:5000/ || exit 1

STOPSIGNAL SIGQUIT