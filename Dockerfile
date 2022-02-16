FROM node:alpine
RUN npm install -g http-server
WORKDIR /orbit
CMD ["http-server"]
