FROM node:24-alpine AS base

WORKDIR /app

# instalar pnpm con corepack (coincide con pnpm@10.19.0 del package.json)
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm run build:strict

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=dependencies /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 8080
CMD ["node", "dist/server.js"]
