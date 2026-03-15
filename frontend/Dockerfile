FROM node:20-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD ["sh", "-c", "npm install && npm start"]