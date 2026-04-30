# Runtime-only образ. Сборка происходит локально (`npm run build`),
# в образ копируется уже готовый dist. Это убирает Node-стадию,
# которая на машинах с малым свободным RAM приводила к зависанию билда.
#
# Перед `docker compose build` обязательно выполнить локально:
#   npm ci
#   npm run build
#
FROM nginx:alpine AS runtime

ENV PORT=5000

RUN apk add --no-cache wget

LABEL maintainer="rebbit123456@gmail.com"
LABEL version="1.0.0"
LABEL description="Present Flow Frontend (prebuilt)"

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY dist /usr/share/nginx/html

# Прекомпрессия раздаваемых файлов в .gz, чтобы nginx с gzip_static не тратил CPU.
RUN find /usr/share/nginx/html -type f \
    \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.svg" -o -name "*.json" \) \
    -exec gzip -9 -k {} \; \
 && chown -R 101:101 /usr/share/nginx/html \
 && chown -R 101:101 /var/cache/nginx \
 && chown -R 101:101 /var/log/nginx \
 && chown -R 101:101 /etc/nginx/conf.d \
 && touch /var/run/nginx.pid \
 && chown -R 101:101 /var/run/nginx.pid

USER nginx

EXPOSE 5000

HEALTHCHECK --interval=60s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -q --spider http://localhost:5000/ || exit 1

STOPSIGNAL SIGQUIT
