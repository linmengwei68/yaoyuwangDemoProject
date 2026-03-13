FROM node:18-alpine AS builder

# Prisma 在 Alpine 上需要 OpenSSL 和 libc 兼容层
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

# --- 生产阶段 ---
FROM node:18-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["node", "dist/main.js"]
