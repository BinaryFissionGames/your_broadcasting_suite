FROM node:12 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit
COPY . .
RUN npm run build

FROM node:12 as dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --no-audit --only=production

FROM node:12-alpine
ARG SERVER_PORT=3080
ARG SERVER_HTTPS_PORT=3443
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=dependencies /app/node_modules node_modules
COPY --from=build /app/build-node ./build-node
EXPOSE $SERVER_PORT $SERVER_HTTPS_PORT
ENV HTTP_PORT=$SERVER_PORT HTTPS_PORT=$SERVER_HTTPS_PORT
CMD ["npm", "run", "start"]
