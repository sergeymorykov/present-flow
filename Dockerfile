FROM node:20-alpine AS build

WORKDIR /app
  
ARG VITE_CPP_COMPILER_URL
ENV VITE_CPP_COMPILER_URL=${VITE_CPP_COMPILER_URL}
  
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
  npm ci
  
COPY . .
RUN npm run build
  
FROM nginx:alpine AS runtime
  
ENV PORT=5000
  
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