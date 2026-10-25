# ── Stage 1: build the Vite bundle ───────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ARG VITE_PRODUCTION_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PRODUCTION_URL=$VITE_PRODUCTION_URL

RUN npm run build

# ── Stage 2: lean runtime (Node built-ins only, no node_modules needed) ──────
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY package.json server.js generate-config.js ./

EXPOSE 3000

CMD ["sh", "-c", "node generate-config.js && node server.js"]
