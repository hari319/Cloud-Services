FROM node:18-alpine as base

ENV PRODUCT_SERVICE_PORT=3200

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

EXPOSE 3200

# CMD npm start
CMD [ "node", "index.js" ]