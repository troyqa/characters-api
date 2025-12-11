# ============ 1) BUILD STAGE ================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# ============ 2) PRODUCTION STAGE ============
FROM node:20-alpine AS prod

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/*.ts ./

EXPOSE 3005

CMD ["node", "dist/server.js"]
