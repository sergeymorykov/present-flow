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

RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:5000/ || exit 1

STOPSIGNAL SIGQUIT