FROM node:18-alpine as base

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

# CMD npm start
CMD [ "node", "index.js" ]