FROM node:18-alpine3.20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

CMD ["sh", "-c", "npm run reset-db && npm start"]