FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8086

CMD ["npx", "expo", "start", "--lan", "--port", "8086"]