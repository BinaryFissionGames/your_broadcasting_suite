FROM node:12 as install
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
COPY ./shared ../shared
RUN npm install --no-audit
COPY backend .

FROM install as test
RUN npm run build-test
RUN npm run test

FROM install as build
RUN npm run build

FROM node:12 as dependencies
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
COPY backend/prisma/schema.prisma ./prisma/schema.prisma
COPY ./shared ../shared
RUN npm install --no-audit --only=production

FROM node:12-alpine
ARG SERVER_PORT=3080
ARG SERVER_HTTPS_PORT=3443
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
COPY --from=dependencies /app/node_modules node_modules
COPY --from=build /app/build-node ./build-node
EXPOSE $SERVER_PORT $SERVER_HTTPS_PORT
ENV HTTP_PORT=$SERVER_PORT HTTPS_PORT=$SERVER_HTTPS_PORT
CMD ["npm", "run", "start"]
