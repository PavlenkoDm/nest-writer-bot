FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN apk add --no-cache sqlite
RUN npm run build
CMD ["node", "dist/main.js"]