FROM node:18-alpine as base

ENV ORDER_SERVICE_PORT=3300

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

EXPOSE 3300

# CMD npm start
CMD [ "node", "index.js" ]