# --- Builder stage ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build && npm run obfuscate

# --- Runtime stage ---
FROM node:20-alpine AS runtime
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist-obf ./dist-obf
EXPOSE 3000
CMD ["node", "dist-obf/server.js"]
