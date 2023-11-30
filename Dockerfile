FROM node:20.10.0-alpine3.18 AS build-stage
WORKDIR /orbit
ADD . .
RUN yarn install
RUN yarn build

FROM node:20.10.0-alpine3.18 as prod-stage
RUN yarn global add serve
COPY package.json yarn.lock .
RUN yarn install --prod
COPY --from=build-stage /orbit/dist /dist
EXPOSE 6090
CMD serve -l 6090 /dist
