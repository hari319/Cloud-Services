FROM node:18-alpine as base

ENV PRODUCT_SERVICE_PORT=3200
ENV MONGO_DB=@cloudmongodb@
ENV MONGO_URL=mongodb://cloudmongodb:PRGybKucziIGNJchjSqqn5vzPpU9jvyFOiIxjDlB8dcJ8PtPeRfroKqBBPAynx5HmpmfbBCCk7FtACDbluFCQQ==@cloudmongodb.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=@cloudmongodb@

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

EXPOSE 3200

# CMD npm start
CMD [ "node", "index.js" ]