FROM node:alpine
RUN yarn global add serve
WORKDIR /orbit
COPY . .
RUN yarn install
RUN yarn build
EXPOSE 6090
