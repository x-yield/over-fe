FROM gitlab-registry.ozon.ru/deploy/images/nodejs-builder:latest as builder

ARG GIT_COMMIT_SHA

ENV CI_COMMIT_SHA=$GIT_COMMIT_SHA

WORKDIR /app

COPY .npmrc .
COPY package.json .

RUN npm install

COPY . .

#lint
RUN npm run lint

# adding commit sha
RUN printf "BUILD_INFO=$CI_COMMIT_SHA" > .env

#build
RUN npm run build

FROM node:10-slim as runner

ENV HOST 0.0.0.0
EXPOSE 3020

WORKDIR /app

COPY --from=builder ./app/package.json .
COPY --from=builder ./app/node_modules ./node_modules/
COPY --from=builder ./app/.nuxt ./.nuxt/
COPY --from=builder ./app/nuxt.config.js .
COPY --from=builder ./app/config.staging.json .
COPY --from=builder ./app/config.production.json .

CMD [ "npm", "start" ]
