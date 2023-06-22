FROM node:18-alpine as base

ENV USER_SERVICE_PORT=3100

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

EXPOSE 3100

# CMD npm start
CMD [ "node", "index.js" ]