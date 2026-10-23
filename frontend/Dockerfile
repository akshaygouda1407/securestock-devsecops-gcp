FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM nginx:stable-alpine

# Apply available Alpine security updates
RUN apk update && \
    apk upgrade --no-cache && \
    mkdir -p /tmp/client_temp /tmp/proxy_temp /tmp/fastcgi_temp \
             /tmp/uwsgi_temp /tmp/scgi_temp && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /tmp

COPY .docker/nginx.conf /etc/nginx/nginx.conf

COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]