FROM node:22-alpine

WORKDIR /nag_server

RUN apk add --no-cache python3 make g++ gcc

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]