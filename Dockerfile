FROM node:14.17-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY . .
ENV TZ Europe/Oslo
ENV NODE_ENV production
# ENV DEBUG=app:/services/tempZones
# ENV DEBUG=app:/services/tempSchedules

CMD [ "node", "index.js" ]