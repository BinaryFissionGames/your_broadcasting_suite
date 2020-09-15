FROM node:12 as build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json frontend/webpack.config.production.js frontend/webpack.config.js frontend/tsconfig.json ./
COPY ./shared ../shared
RUN npm install --no-audit
COPY ./frontend/src ./src
RUN npm run build-production

FROM nginx:mainline-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
RUN chmod 644 *.*
