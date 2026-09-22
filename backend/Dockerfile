# backend/Dockerfile
FROM node:18-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER 1001
EXPOSE 3001
CMD ["node", "src/index.js"]