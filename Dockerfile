# Use Node 20 alpine as base image
FROM node:20-alpine AS base

# Install necessary tools
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma Client
RUN npm run db:generate

# Build the API backend
RUN npm run build:all

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Copy necessary files from base
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/apps/api/dist ./apps/api/dist
COPY --from=base /app/prisma ./prisma

EXPOSE 10000

ENV PORT 10000
ENV HOST "0.0.0.0"

CMD ["npm", "run", "start:api"]
